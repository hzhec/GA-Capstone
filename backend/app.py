from flask_cors import CORS, cross_origin
import psycopg2
from dotenv import load_dotenv
import os
from PIL import Image
import numpy as np
from ultralytics import YOLO
import onnxruntime as ort
from uuid import uuid4
import base64
import cv2
import bcrypt
import jwt
from supabase import create_client
from flask import Flask, jsonify, request, Response

load_dotenv()
database_url = os.environ.get('DB_URL')
database_name = os.environ.get('DB_NAME')
database_password = os.environ.get('DB_PASSWORD')
database_user = os.environ.get('DB_USER')
database_port = os.environ.get('DB_PORT')

jwt_secret_key = os.environ.get('JWT_SECRET_KEY')

url = os.environ.get('SUPABASE_PROJECT_URL')
key = os.environ.get('SUPABASE_API_KEY')
# print(url, key)
supabase = create_client(url, key)

model = YOLO("yolov8m.pt")
# model.export(format="onnx")

with open("classes.txt", "r") as file:
    yolo_classes = [line.strip() for line in file]
    
app = Flask(__name__)

app.config[
    'DATABASE_URL'
] = f'{database_name}://{database_user}:{database_password}@{database_url}'
app.config['UPLOAD_FOLDER'] = 'tmp'

CORS(app,resources={r"/*":{"origins":"*"}})
rtsp = ''
user_id = ''
streaming_enabled = True

try:
    conn = psycopg2.connect(app.config['DATABASE_URL'])
    cursor = conn.cursor()
    print('Connected to database successfully!')
except (psycopg2.Error, Exception) as error:
    print('Error connecting to the database:', error)

''' GET ALL IMAGES/VIDEOS DATA FROM DATABASE '''
@app.route('/getAll')
@cross_origin()
def get_all():
    user = request.args.get('user')
    media_type = request.args.get('mediaType')
    fetched_data = []
    if user == 'admin':
        if media_type == 'image':
            query = '''SELECT * FROM image_boxes ORDER BY id DESC'''
            cursor.execute(query)
            rows = cursor.fetchall()
            for row in rows:
                fetched_data.append({
                    'id': row[0],
                    'created_at': str(row[1]),
                    'updated_at': str(row[2]),
                    'uuid': row[3],
                    'boxes': row[4],
                    'image_name': row[6],
                })
        elif media_type == 'video':
            query = '''SELECT * FROM video_boxes ORDER BY id DESC'''
            cursor.execute(query)
            rows = cursor.fetchall()
            for row in rows:
                fetched_data.append({
                    'id': row[0],
                    'created_at': str(row[1]),
                    'updated_at': str(row[2]),
                    'uuid': row[3],
                    'boxes': row[4],
                    'video_name': row[8],
                })
    else: 
        cursor.execute("SELECT id FROM accounts WHERE username = %s", (user,))
        user_id = cursor.fetchone()[0]
        if media_type == 'image':
            query = f'''SELECT * FROM image_boxes WHERE "user_id"={user_id} ORDER BY id DESC'''
            cursor.execute(query)
            rows = cursor.fetchall()
            for row in rows:
                fetched_data.append({
                    'id': row[0],
                    'created_at': str(row[1]),
                    'updated_at': str(row[2]),
                    'uuid': row[3],
                    'boxes': row[4],
                    'image_name': row[6],
                })
        elif media_type == 'video':
            query = f'''SELECT * FROM video_boxes WHERE "user_id"={user_id} ORDER BY id DESC'''
            cursor.execute(query)
            rows = cursor.fetchall()
            for row in rows:
                fetched_data.append({
                    'id': row[0],
                    'created_at': str(row[1]),
                    'updated_at': str(row[2]),
                    'uuid': row[3],
                    'boxes': row[4],
                    'video_name': row[8],
                })
    return jsonify({'all_data': fetched_data})

''' UPDATE IMAGE/VIDEO NAME IN DATABASE '''
@app.route('/updateName', methods=['PUT'])
@cross_origin()
def update_name():
    uuid = request.json['uuid']
    name = request.json['name']
    media_type = request.args.get('mediaType')
    if media_type == 'image':
        cursor.execute("UPDATE image_boxes SET image_name=%s WHERE uuid=%s", (name, uuid))
        conn.commit()
        return jsonify({'msg': 'Image name updated'})
    elif media_type == 'video':
        cursor.execute("UPDATE video_boxes SET video_name=%s WHERE uuid=%s", (name, uuid))
        conn.commit()
        return jsonify({'msg': 'Video name updated'})

''' DELETE SINGLE IMAGE/VIDEO FROM DATABASE '''
@app.route('/deleteMedia', methods=['DELETE'])
@cross_origin()
def delete_media():
    uuid = request.json['uuid']
    media_type = request.args.get('mediaType')
    if media_type == 'image':
        cursor.execute("DELETE FROM image_boxes WHERE uuid=%s", (uuid,))
        conn.commit()
        supabase.storage.from_("image-bucket").remove(f'{uuid}.jpeg')
        return jsonify({'msg': 'Image deleted from database'})
    elif media_type == 'video':
        cursor.execute("DELETE FROM video_boxes WHERE uuid=%s", (uuid,))
        conn.commit()
        supabase.storage.from_("video-bucket").remove(f'{uuid}.mp4')
        return jsonify({'msg': 'Video deleted from database'})
    
''' DELETE MULTIPLE IMAGES/VIDEOS FROM DATABASE '''
@app.route('/deleteMultipleMedias', methods=['DELETE'])
@cross_origin()
def delete_multiple_medias():
    uuid = request.json['uuidArray']
    media_type = request.args.get('mediaType')
    if media_type == 'image':
        cursor.execute("DELETE FROM image_boxes WHERE uuid IN %s", (tuple(uuid),))
        conn.commit()
        for u in uuid: 
            supabase.storage.from_("image-bucket").remove(f'{u}.jpeg')
        return jsonify({'msg': 'Images deleted from database'})
    elif media_type == 'video':
        cursor.execute("DELETE FROM video_boxes WHERE uuid IN %s", (tuple(uuid),))
        conn.commit()
        for u in uuid: 
            supabase.storage.from_("video-bucket").remove(f'{u}.mp4')
        return jsonify({'msg': 'Videos deleted from database'})

''' PROCESS IMAGE '''
@app.route('/upload_image_processing', methods=['POST'])
@cross_origin()
def process_image():
    print(request.form.get)
    image_file = request.files['imageFile']
    user_id = request.form.get('userId')
    class_name = request.form.get('className')
    boxes, objects = detect_objects_on_image(image_file.stream, class_name)
    uuid = str(uuid4())
    if len(boxes) != 0:
        query = '''INSERT INTO image_boxes ("uuid", "boxes", "user_id", "image_name") VALUES (%s, %s, %s, %s)'''
        cursor.execute(query, (uuid, str(boxes), user_id, str(objects)))
        conn.commit()
        return jsonify({'boxes': boxes, 'uuid': uuid, 'status': 'success', 'msg': 'Objects detected'})
    return jsonify({'msg': 'No objects detected', 'status': 'fail'})

def detect_objects_on_image(image, class_name):
    input, img_width, img_height = prepare_input(image)
    # print(input)
    output = run_model(input)
    results, objects = process_output(output,img_width,img_height, class_name)
    return results, objects

def prepare_input(image):
    """
    Prepare input image for model prediction.
    """
    img = Image.open(image)
    img_width, img_height = img.size
    img = img.resize((640, 640))
    img = img.convert("RGB")
    input = np.array(img)
    # Transpose the image dimensions
    input = input.transpose(2, 0, 1)
    # Reshape the image to match the model input shape
    input = input.reshape(1, 3, 640, 640) / 255.0
    return input.astype(np.float32), img_width, img_height

def run_model(input):
    model = ort.InferenceSession("yolov8m.onnx", providers=['CPUExecutionProvider'])
    outputs = model.run(["output0"], {"images":input})
    return outputs[0]

def process_output(output, img_width, img_height, class_name):
    """
    Process the output of a model inference and extract relevant bounding boxes.
    """
    # Convert output to float and transpose it
    output = output[0].astype(float)
    output = output.transpose()

    boxes = []
    for row in output:
        # Find the maximum probability and skip if it's below 0.5 (50%)
        prob = row[4:].max()
        if prob < 0.5:
            continue
        
        # Extract the coordinates of the bounding box
        xc, yc, w, h = row[:4]
        x1 = (xc - w/2) / 640 * img_width
        y1 = (yc - h/2) / 640 * img_height
        x2 = (xc + w/2) / 640 * img_width
        y2 = (yc + h/2) / 640 * img_height
        
        # Get the label of the bounding box
        label = yolo_classes[row[4:].argmax()]
        
        # Append the bounding box to the list if it matches the specified class
        if class_name == 'none': 
            boxes.append([x1, y1, x2, y2, label, prob])
        else: 
            if label == class_name:
                boxes.append([x1, y1, x2, y2, label, prob])

    # Sort the bounding boxes by probability in descending order
    boxes.sort(key=lambda x: x[5], reverse=True)
    
    result = []
    detected_objects = []
    while len(boxes) > 0:
        # Add the box with the highest probability to the result
        result.append(boxes[0])
        if boxes[0][4] not in detected_objects:
            detected_objects.append(boxes[0][4])
        # Remove all boxes with high intersection over union (IOU) with the selected box
        boxes = [box for box in boxes if iou(box, boxes[0]) < 0.7]
    
    return result, detected_objects

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

''' PROCESS VIDEO '''
@app.route('/upload_video_processing', methods=['POST'])
@cross_origin()
def load_video():
    video_file = request.files['videoFile']
    user_id = request.form.get('userId')
    
    uuid = str(uuid4())
    video_path = os.path.join(app.config['UPLOAD_FOLDER'], f'{uuid}.mp4')
    video_file.save(video_path)
    
    processed_video_path = os.path.join(app.config['UPLOAD_FOLDER'], f'processed_{uuid}.mp4')
    boxes, width, height, objects = process_video(video_path, processed_video_path)
    if boxes:
        upload_video_sup(uuid, processed_video_path)
        upload_video_data(uuid, boxes, width, height, user_id, objects)
        
    os.remove(video_path)
    os.remove(processed_video_path)
    
    return jsonify({'uuid': uuid, 'msg': 'Video processed'})

def process_video(video, output_path):
    frames_info = []
    detected_objects = []

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
            if conf > 0.6:
                (x, y, x2, y2) = bbox
                # print([x, y, x2, y2, result.names[cls], conf])
                frames_info.append([x, y, x2, y2, result.names[cls], conf])
                if result.names[cls] not in detected_objects:
                    detected_objects.append(result.names[cls])
                cv2.rectangle(frame, (x, y), (x2, y2), (0, 0, 225), 2)
                cv2.putText(frame, str(result.names[cls]), (x, y - 5), cv2.FONT_HERSHEY_PLAIN, 2, (0, 0, 225), 2)
            
        video_output.write(frame)
            
    cap.release()
    video_output.release()
    cv2.destroyAllWindows()
    
    return frames_info, width, height, detected_objects

''' UPLOAD IMAGE/VIDEO TO SUPABASE STORAGE '''
@app.route('/upload_to_supabase', methods=['POST'])
@cross_origin()
def upload_image_sup():
    image_data = request.json['processed_file']
    uuid = request.json['uuid']
    image = base64.b64decode(image_data)
    image_filename = f'{uuid}.jpeg'
    supabase.storage.from_("image-bucket").upload(image_filename, image, {"content-type": "image/jpeg"})
    image_data = ''
    return jsonify({'msg': 'Image uploaded to supabase storage'})

def upload_video_sup(uuid, video_path):
    with open(video_path, 'rb') as video_file:
        supabase.storage.from_("video-bucket").upload(f'{uuid}.mp4', video_file, {'content-type':'video/mp4'})

def upload_video_data(uuid, boxes, width, height, user_id, objects):
    query = '''INSERT INTO video_boxes ("uuid", "boxes", "vid_width", "vid_height", "user_id", "video_name") VALUES (%s, %s, %s, %s, %s, %s)'''
    cursor.execute(query, (uuid, str(boxes), width, height, user_id, str(objects)))
    conn.commit()

''' RTSP/WEBCAM VIDEO STREAM '''    
@app.route('/add_rtsp', methods=['POST'])
@cross_origin()
def add_rtsp():
    global rtsp, user_id, streaming_enabled
    print(request.json)
    rtsp = request.json['rtsp']
    user_id = request.json['userId']
    streaming_enabled = True
    if rtsp == '0':
        return jsonify({'msg': 'Connecting to webcam'})
    else:
        return jsonify({'msg': f'Connecting to {rtsp}'})
    
def generate_frames():
    global rtsp, user_id, streaming_enabled
    boxes = [] 
    uuid = str(uuid4())
    output_path = os.path.join(app.config['UPLOAD_FOLDER'], f'processed_{uuid}.mp4')
    
    if rtsp == '0':
        live_stream = cv2.VideoCapture(0)
    else:
        live_stream = cv2.VideoCapture(rtsp)
        
    width = int(live_stream.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(live_stream.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fourcc = cv2.VideoWriter_fourcc(*'h264')
    video_output = cv2.VideoWriter(output_path, fourcc, 20.0, (width, height))
        
    while streaming_enabled:
        if live_stream.isOpened():
            ret, frame = live_stream.read()
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
                    boxes.append([x, y, x2, y2, result.names[cls], conf])
                    cv2.rectangle(frame, (x, y), (x2, y2), (0, 0, 225), 2)
                    cv2.putText(frame, str(result.names[cls]), (x, y - 5), cv2.FONT_HERSHEY_PLAIN, 2, (0, 0, 225), 2)
            
            video_output.write(frame)
            _, buffer = cv2.imencode('.jpeg', frame)
            frame = buffer.tobytes()
            
            yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n') 
            
    live_stream.release()
    video_output.release()
    cv2.destroyAllWindows()
    upload_video_sup(uuid, output_path)
    upload_video_data(uuid, boxes, width, height, user_id)
    
    os.remove(output_path)
    rtsp = ''
    
@app.route('/start_stream')
@cross_origin()
def live_stream():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/stop_stream')
@cross_origin()
def stop_stream():
    global streaming_enabled
    streaming_enabled = False
    return jsonify({'msg': 'Stopped streaming'})

''' REGISTER AND LOGIN ACCOUNT '''
@app.route('/register_account', methods=['POST'])
@cross_origin()
def register_account():
    username = request.json['username']
    print(username)
    cursor.execute("SELECT id FROM accounts WHERE username = %s", (username,))
    row = cursor.fetchone()
    if row is not None:
        return jsonify({'msg': 'Account already exists', 'status': 'fail'})
  
    encrypted_pw = encrypt_password({'password': request.json['password']})
    cursor.execute("INSERT INTO accounts (username, password) VALUES (%s, %s)", (username, str(encrypted_pw)))
    conn.commit()
    return jsonify({'msg': 'Account registered successfully', 'status': 'success'})
    
def encrypt_password(data):
    password = data['password']
    salt = bcrypt.gensalt()
    encrypted = bcrypt.hashpw(password.encode('utf-8'), salt)
    return encrypted

@app.route('/login_account', methods=['POST'])
@cross_origin()
def login_account():
    username = request.json['username']
    cursor.execute("SELECT id, username, password FROM accounts WHERE username = %s",
    (username,))
    account = cursor.fetchone()
    print(account)
    if account is None: 
        return jsonify({'msg': 'Account not found', 'status': 'fail'})
    decrypted = decrypt_password({'db_pw': account[2].split("'")[1], 'password': request.json['password']})
    if not decrypted: 
        return jsonify({'msg': 'Incorrect password', 'status': 'fail'})
    token = create_secret_token(account[0])
    return jsonify({'msg': 'Login successful', 'authToken': token, 'username': account[1], 'userId': account[0], 'status': 'success'})

def decrypt_password(data):
    db_pw = data['db_pw'].encode('utf-8')
    password = data['password'].encode('utf-8')
    return bcrypt.checkpw(password, db_pw)

def create_secret_token(data):
    return jwt.encode({"username": data}, jwt_secret_key, algorithm="HS256")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=65432, debug=False)
