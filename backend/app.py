from flask import Flask, request, jsonify, Response
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO
import psycopg2
from dotenv import load_dotenv
import os
from PIL import Image
import numpy as np
from ultralytics import YOLO
import onnxruntime as ort
from uuid import uuid4
import base64
import json
import cv2
from io import BytesIO
from threading import Event
import bcrypt
import jwt

# from storage3 import create_client
from supabase import create_client

load_dotenv()
# Get database configuration from environment variables
database_url = os.environ.get('DB_URL')
database_name = os.environ.get('DB_NAME')
database_password = os.environ.get('DB_PASSWORD')
database_user = os.environ.get('DB_USER')
database_port = os.environ.get('DB_PORT')

jwt_secret_key = os.environ.get('JWT_SECRET_KEY')

url = os.environ.get('SUPABASE_PROJECT_URL')
key = os.environ.get('SUPABASE_API_KEY')
# print(url, key)
# headers = {'apiKey': key, 'Authorization': f'Bearer {key}'}
supabase = create_client(url, key)
# supabase = create_client(url, headers, is_async=False)

model = YOLO("yolov8m.pt")
model.export(format="onnx")
MAX_BUFFER_SIZE = 200 * 1000 * 1000  # 100 MB

with open("classes.txt", "r") as file:
    yolo_classes = [line.strip() for line in file]
    
app = Flask(__name__)
# CORS(app)

app.config[
    'DATABASE_URL'
] = f'{database_name}://{database_user}:{database_password}@{database_url}'
app.config['UPLOAD_FOLDER'] = 'tmp'

CORS(app,resources={r"/*":{"origins":"*"}})
socketio = SocketIO(app, cors_allowed_origins="*", max_http_buffer_size=MAX_BUFFER_SIZE)
rtsp = ''
stop_event = Event()

try:
    # Connect to the database
    conn = psycopg2.connect(app.config['DATABASE_URL'])
    cursor = conn.cursor()
    # Connection successful
    print('Connected to database successfully!')
except (psycopg2.Error, Exception) as error:
    # Error connecting to the database
    print('Error connecting to the database:', error)

@socketio.on('get_all_images')
def get_all_images(data):
    fetched_data = []
    user_id = data['userId']
    query = '''SELECT * FROM image_boxes WHERE "user_id"=%s ORDER BY id ASC'''
    cursor.execute(query, user_id)
    rows = cursor.fetchall()
    for row in rows:
        fetched_data.append({
            'id': row[0],
            'created_at': str(row[1]),
            'updated_at': str(row[2]),
            'uuid': row[3],
            'boxes': row[4]
        })
    socketio.emit('all_images', {'all_images': fetched_data})
    
@socketio.on('delete_image')
def delete_image(data):
    # data = json.loads(request.get_data())
    uuid = data['uuid']
    cursor.execute("DELETE FROM image_boxes WHERE uuid=%s", (uuid,))
    conn.commit()
    supabase.storage.from_("image-bucket").remove(f'{uuid}.jpeg')
    # return jsonify({'msg': 'Image deleted from database'})
    socketio.emit('delete_image', {'msg': 'Image deleted from database'})

@socketio.on('delete_multiple_images')
def delete_multiple_images(data):
    uuid = data['uuid']
    print(uuid)
    cursor.execute("DELETE FROM image_boxes WHERE uuid IN %s", (tuple(uuid),))
    conn.commit()
    for u in uuid: 
        supabase.storage.from_("image-bucket").remove(f'{u}.jpeg')
    socketio.emit('delete_multiple_images', {'msg': 'Images deleted from database'})
    
@socketio.on('upload_image_processing')
def process_image(data):
    user_id = data['userId']
    image_file = data['imageFile']
    data_stream = BytesIO(image_file)
    boxes = detect_objects_on_image(data_stream)
    uuid = str(uuid4())
    query = '''INSERT INTO image_boxes ("uuid", "boxes", "user_id") VALUES (%s, %s, %s)'''
    cursor.execute(query, (uuid, str(boxes), user_id))
    conn.commit()
    # return jsonify({'boxes': boxes, 'uuid': uuid})
    socketio.emit('image_process_completed', {'boxes': boxes, 'uuid': uuid})

def detect_objects_on_image(image):
    input, img_width, img_height = prepare_input(image)
    # print(input)
    output = run_model(input)
    results = (process_output(output,img_width,img_height))
    return results

def prepare_input(image):
    img = Image.open(image)
    img_width, img_height = img.size
    img = img.resize((640, 640))
    img = img.convert("RGB")
    input = np.array(img)
    input = input.transpose(2, 0, 1)
    input = input.reshape(1, 3, 640, 640) / 255.0
    return input.astype(np.float32), img_width, img_height

def run_model(input):
    model = ort.InferenceSession("yolov8m.onnx", providers=['CPUExecutionProvider'])
    outputs = model.run(["output0"], {"images":input})
    return outputs[0]

def process_output(output,img_width,img_height):
    output = output[0].astype(float)
    output = output.transpose()

    boxes = []
    for row in output:
        prob = row[4:].max()
        if prob < 0.5:
            continue
        class_id = row[4:].argmax()
        label = yolo_classes[class_id]
        xc, yc, w, h = row[:4]
        x1 = (xc - w/2) / 640 * img_width
        y1 = (yc - h/2) / 640 * img_height
        x2 = (xc + w/2) / 640 * img_width
        y2 = (yc + h/2) / 640 * img_height
        boxes.append([x1, y1, x2, y2, label, prob])

    boxes.sort(key=lambda x: x[5], reverse=True)
    result = []
    while len(boxes) > 0:
        result.append(boxes[0])
        boxes = [box for box in boxes if iou(box, boxes[0]) < 0.7]
    return result

def iou(box1,box2):
    return intersection(box1,box2)/union(box1,box2)

def union(box1,box2):
    box1_x1,box1_y1,box1_x2,box1_y2 = box1[:4]
    box2_x1,box2_y1,box2_x2,box2_y2 = box2[:4]
    box1_area = (box1_x2-box1_x1)*(box1_y2-box1_y1)
    box2_area = (box2_x2-box2_x1)*(box2_y2-box2_y1)
    return box1_area + box2_area - intersection(box1,box2)

def intersection(box1,box2):
    box1_x1,box1_y1,box1_x2,box1_y2 = box1[:4]
    box2_x1,box2_y1,box2_x2,box2_y2 = box2[:4]
    x1 = max(box1_x1,box2_x1)
    y1 = max(box1_y1,box2_y1)
    x2 = min(box1_x2,box2_x2)
    y2 = min(box1_y2,box2_y2)
    return (x2-x1)*(y2-y1)
    
@socketio.on('upload_to_supabase')
def upload_image_sup(data):
    image_data = data['processed_file']
    uuid = data['uuid']
    image = base64.b64decode(image_data)
    image_filename = f'{uuid}.jpeg'
    supabase.storage.from_("image-bucket").upload(image_filename, image, {"content-type": "image/jpeg"})
    image_data = ''
    socketio.emit('upload_image_supabase', {'msg': 'Image uploaded to supabase storage'})

@socketio.on('upload_video_processing')
def load_video(data, id):
    user_id = id['userId']
    uuid = str(uuid4())
    video_path = os.path.join(app.config['UPLOAD_FOLDER'], f'{uuid}.mp4')
    with open(video_path, 'wb') as video_file:
        video_file.write(data)
    
    processed_video_path = os.path.join(app.config['UPLOAD_FOLDER'], f'processed_{uuid}.mp4')
    boxes, width, height = process_video(video_path, processed_video_path)
    if boxes:
        upload_video_sup(uuid, processed_video_path)
        upload_video_data(uuid, boxes, width, height, user_id)
        
    os.remove(video_path)
    os.remove(processed_video_path)
    
    socketio.emit('video_process_completed', {'uuid': uuid})

def process_video(video, output_path):
    frames_info = []

    cap = cv2.VideoCapture(video)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    fourcc = cv2.VideoWriter_fourcc(*'h264')
    video_output = cv2.VideoWriter(output_path, fourcc, 20.0, (width, height))
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        # processed_frame = process_frame(frame)
        results = model(frame, device = 'mps')
        result = results[0]
        bboxes = np.array(result.boxes.xyxy.cpu(), dtype="int")
        classes = np.array(result.boxes.cls.cpu(), dtype="int")
        confidences = np.array(result.boxes.conf.cpu(), dtype="float")
        
        for cls, bbox, conf in zip(classes, bboxes, confidences): 
            if conf > 0.5:
                (x, y, x2, y2) = bbox
                # print([x, y, x2, y2, result.names[cls], conf])
                frames_info.append([x, y, x2, y2, result.names[cls], conf])
                cv2.rectangle(frame, (x, y), (x2, y2), (0, 0, 225), 2)
                cv2.putText(frame, str(result.names[cls]), (x, y - 5), cv2.FONT_HERSHEY_PLAIN, 2, (0, 0, 225), 2)
            
        video_output.write(frame)
            
    cap.release()
    video_output.release()
    cv2.destroyAllWindows()
    
    return frames_info, width, height

def upload_video_sup(uuid, video_path):
    with open(video_path, 'rb') as video_file:
        supabase.storage.from_("video-bucket").upload(f'{uuid}.mp4', video_file, {'content-type':'video/mp4'})
    return jsonify({'msg': 'Video uploaded to supabase storage'})

def upload_video_data(uuid, boxes, width, height, user_id):
    query = '''INSERT INTO video_boxes ("uuid", "boxes", "vid_width", "vid_height", "user_id") VALUES (%s, %s, %s, %s, %s)'''
    cursor.execute(query, (uuid, str(boxes), width, height, user_id))
    conn.commit()
    return jsonify({'uuid': uuid, 'frames': str(boxes), 'width': width, 'height': height})

@socketio.on('get_all_videos')
def get_all_videos(data):
    fetched_data = []
    user_id = data['user_id']
    print(user_id)
    query = '''SELECT * FROM video_boxes WHERE "user_id"=%s ORDER BY id ASC'''
    cursor.execute(query, user_id)
    rows = cursor.fetchall()
    for row in rows:
        fetched_data.append({
            'id': row[0],
            'created_at': str(row[1]),
            'updated_at': str(row[2]),
            'uuid': row[3],
            'boxes': row[4]
        })
    socketio.emit('all_videos', {'all_videos': fetched_data})

@socketio.on('delete_video')
def delete_video(data):
    uuid = data['uuid']
    cursor.execute("DELETE FROM video_boxes WHERE uuid=%s", (uuid,))
    conn.commit()
    supabase.storage.from_("video-bucket").remove(f'{uuid}.mp4')
    socketio.emit('delete_video', {'msg': 'Video deleted from database'})

@socketio.on('delete_multiple_videos')
def delete_multiple_videos(data):
    uuid = data['uuid']
    cursor.execute("DELETE FROM video_boxes WHERE uuid IN %s", (tuple(uuid),))
    conn.commit()
    for u in uuid: 
        supabase.storage.from_("video-bucket").remove(f'{u}.mp4')
    socketio.emit('delete_multiple_videos', {'msg': 'Videos deleted from database'})

@socketio.on('add_rtsp')
def add_rtsp(data):
    global rtsp
    rtsp = data['rtsp']
    
@socketio.on('video_stream')
def video_stream(stop_event):
    global rtsp
    if rtsp:
        if rtsp == '0':
            live_camera = cv2.VideoCapture(0)
        else: 
            live_camera = cv2.VideoCapture(rtsp)
        
        # live_camera.set(cv2.CAP_PROP_FPS, 30)
        while not stop_event.is_set(): 
            if live_camera.isOpened():
                ret, frame = live_camera.read()
                if not ret:
                    break 
                
                results = model(frame, device = 'mps')
                result = results[0]
                bboxes = np.array(result.boxes.xyxy.cpu(), dtype="int")
                classes = np.array(result.boxes.cls.cpu(), dtype="int")
                confidences = np.array(result.boxes.conf.cpu(), dtype="float")
                
                for cls, bbox, conf in zip(classes, bboxes, confidences): 
                    if conf > 0.5:
                        (x, y, x2, y2) = bbox
                        cv2.rectangle(frame, (x, y), (x2, y2), (0, 0, 225), 2)
                        cv2.putText(frame, str(result.names[cls]), (x, y - 5), cv2.FONT_HERSHEY_PLAIN, 2, (0, 0, 225), 2)
                
                _, buffer = cv2.imencode('.jpeg', frame)
                frame_as_base64 = base64.b64encode(buffer).decode('utf-8')
                
                socketio.emit('video_frame', {'image': frame_as_base64})
                
        live_camera.release()
        cv2.destroyAllWindows()
        rtsp = ''
        
@socketio.on('connect_live_cam')
def handle_connect():
    global stop_event
    stop_event.clear()
    socketio.start_background_task(video_stream, stop_event)
    
@socketio.on('disconnect_live_cam')
def handle_disconnect():
    global stop_event
    stop_event.set()
    
@socketio.on('register_account')
def register_account(data):
    username = data['username']
    cursor.execute("SELECT id FROM accounts WHERE username = %s", (username,))
    row = cursor.fetchone()
    if row is not None:
        socketio.emit('registration_status', {'msg': 'Account already exists'})
        return
  
    encrypted_pw = encrypt_password({'password': data['password']})
    cursor.execute("INSERT INTO accounts (username, password) VALUES (%s, %s)", (username, str(encrypted_pw)))
    conn.commit()
    socketio.emit('registration_status', {'msg': 'Account registered successfully'})
    
def encrypt_password(data):
    password = data['password']
    salt = bcrypt.gensalt()
    encrypted = bcrypt.hashpw(password.encode('utf-8'), salt)
    return encrypted

@socketio.on('login_account')
def login_account(data):
    username = data['username']
    query = '''SELECT id, username, password FROM accounts WHERE username=%s'''
    cursor.execute(query, (username,))
    account = cursor.fetchone()
    print(account)
    if account is None: 
        socketio.emit('login_status', {'msg': 'Account not found'})
        return
    decrypted = decrypt_password({'db_pw': account[2].split("'")[1], 'password': data['password']})
    if not decrypted: 
        socketio.emit('login_status', {'msg': 'Incorrect password'})
        return
    token = create_secret_token(account[0])
    # print(token)
    socketio.emit('login_status', {'msg': 'Login successful', 'authToken': token, 'username': account[1], 'userId': account[0], 'status': 'success'})

def decrypt_password(data):
    db_pw = data['db_pw'].encode('utf-8')
    password = data['password'].encode('utf-8')
    return bcrypt.checkpw(password, db_pw)

def create_secret_token(data):
    return jwt.encode({"username": data}, jwt_secret_key, algorithm="HS256")

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=65432, debug=True)
