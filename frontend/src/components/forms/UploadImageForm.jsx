import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const UploadImageForm = () => {
	const canvasRef = useRef(null);
	const [uuid, setUuid] = useState(null);
	const [imageFile, setImageFile] = useState(null);
	const [boxes, setBoxes] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	const socket = io('http://127.0.0.1:65432');

	useEffect(() => {
		if (boxes) {
			processImage(imageFile, boxes);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [boxes]);

	const handleImageChange = (event) => {
		const newImageFile = event.target.files[0];
		setImageFile(newImageFile);

		if (newImageFile) {
			socket.emit('upload_image_processing', newImageFile);
			socket.on('image_process_completed', (data) => {
				const { boxes, uuid } = data;
				setBoxes(boxes);
				setUuid(uuid);
				setIsLoading(true);
			});
		}

		// console.log("event", event.target.files[0]);
	};

	const processImage = (file, boxes) => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		const img = new Image();
		img.src = URL.createObjectURL(file);
		img.onload = () => {
			const canvasWidth = 840;
			const scaleFactor = canvasWidth / img.width;
			const canvasHeight = img.height * scaleFactor;

			canvas.width = canvasWidth;
			canvas.height = canvasHeight;
			ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
			ctx.strokeStyle = '#00FF00';
			ctx.lineWidth = 4;
			ctx.font = 'bold 20px serif';

			boxes.forEach(([x1, y1, x2, y2, label, confidence]) => {
				x1 *= scaleFactor;
				y1 *= scaleFactor;
				x2 *= scaleFactor;
				y2 *= scaleFactor;

				if (confidence > 0.6) {
					ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
					ctx.fillStyle = '#00ff00';
					const width = ctx.measureText(label).width;
					ctx.fillRect(x1, y1, width + 5, 25);
					ctx.fillStyle = '#000000';
					ctx.fillText(label, x1, y1 + 18);
				}
			});

			const dataUrl = canvas.toDataURL();
			if (dataUrl) {
				upload_image(dataUrl, uuid);
			}
		};
	};

	const upload_image = (file, uuid) => {
		const image_data = file.split(',')[1].replace(' ', '+');
		socket.emit('upload_to_supabase', { processed_file: image_data, uuid: uuid });
	};

	return (
		<div className="flex justify-center w-full">
			<div className="flex flex-col justify-center w-full px-10">
				<h1 className="text-3xl font-bold text-center my-4">Upload Image</h1>
				<input
					type="file"
					id="imageInput"
					accept="image/jpeg, image/png, image/jpg, image/webp"
					onChange={handleImageChange}
					className="file-input file-input-bordered  w-full max-w-xs mx-auto my-3"
				/>
				{isLoading && <canvas className="w-full max-w-6xl my-5 mx-auto" ref={canvasRef} />}
			</div>
		</div>
	);
};

export default UploadImageForm;
