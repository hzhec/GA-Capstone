from flask import Flask, request, jsonify
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
import json

# from storage3 import create_client
from supabase import create_client

load_dotenv()
# Get database configuration from environment variables
database_url = os.environ.get('DB_URL')
database_name = os.environ.get('DB_NAME')
database_password = os.environ.get('DB_PASSWORD')
database_user = os.environ.get('DB_USER')
database_port = os.environ.get('DB_PORT')

url = os.environ.get('SUPABASE_PROJECT_URL')
key = os.environ.get('SUPABASE_API_KEY')
# print(url, key)
# headers = {'apiKey': key, 'Authorization': f'Bearer {key}'}
supabase = create_client(url, key)
# supabase = create_client(url, headers, is_async=False)

model = YOLO("yolov8m.pt")
model.export(format="onnx")
with open("classes.txt", "r") as file:
    yolo_classes = [line.strip() for line in file]
    
app = Flask(__name__)
CORS(app)

app.config[
    'DATABASE_URL'
] = f'{database_name}://{database_user}:{database_password}@{database_url}'

try:
    # Connect to the database
    conn = psycopg2.connect(app.config['DATABASE_URL'])
    cursor = conn.cursor()
    # cursor.execute("SELECT * FROM image_boxes")
    # rows = cursor.fetchall()
    # print(rows)
    # Connection successful
    print('Connected to database successfully!')
except (psycopg2.Error, Exception) as error:
    # Error connecting to the database
    print('Error connecting to the database:', error)
    
@app.route('/get_all_images', methods=['GET'])
@cross_origin()
def get_all_images():
    fetched_data = []
    cursor.execute("SELECT * FROM image_boxes")
    rows = cursor.fetchall()
    for row in rows:
        fetched_data.append({
            'id': row[0],
            'created_at': row[1],
            'updated_at': row[2],
            'uuid': row[3],
            'boxes': row[4]
        })
    return jsonify({'all_images': fetched_data})

@app.route('/upload_image_supabase', methods=['POST'])
@cross_origin()
def upload_image_sup():
    data = json.loads(request.get_data())
    image_data = data['file']
    uuid = data['uuid']
    image = base64.b64decode(image_data.split(',')[1].replace(' ','+'))
    image_filename = f'{uuid}.jpeg'
    response = supabase.storage.from_("image-bucket").upload(image_filename, image, {"content-type": "image/jpeg"})
    return jsonify({'msg': 'Image uploaded to supabase storage'})
    
@app.route('/load_image', methods=['POST'])
@cross_origin()
def load_image():
    data = request.files["image_file"]
    boxes = detect_objects_on_image(data.stream)
    uuid = str(uuid4())
    query = '''INSERT INTO image_boxes ("uuid", "boxes") VALUES (%s, %s)'''
    cursor.execute(query, (uuid, str(boxes)))
    conn.commit()
    return jsonify({'boxes': boxes, 'uuid': uuid})

def detect_objects_on_image(image):
    input, img_width, img_height = prepare_input(image)
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

@app.route('/delete_image', methods=['DELETE'])
@cross_origin()
def delete_image():
    data = json.loads(request.get_data())
    uuid = str(data['uuid'])
    print(uuid)
    cursor.execute("DELETE FROM image_boxes WHERE uuid=%s", (uuid,))
    conn.commit()
    supabase.storage.from_("image-bucket").remove(f'{uuid}.jpeg')
    return jsonify({'msg': 'Image deleted from database'})

@app.route('/delete_multiple_images', methods=['DELETE'])
@cross_origin()
def delete_multiple_images():
    data = json.loads(request.get_data())
    uuid = data['uuid']
    cursor.execute("DELETE FROM image_boxes WHERE uuid IN %s", (tuple(uuid),))
    conn.commit()
    for u in uuid: 
        supabase.storage.from_("image-bucket").remove(f'{u}.jpeg')
    return jsonify({'msg': 'Images deleted from database'})

if __name__ == '__main__':
    app.run(debug=True)
