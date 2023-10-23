import { useEffect, useState, useRef } from 'react';

const UploadImageForm = () => {
	const canvasRef = useRef(null);
	const [uuid, setUuid] = useState(null);
	const [imageFile, setImageFile] = useState(null);
	const [boxes, setBoxes] = useState(null);

	useEffect(() => {
		if (uuid && boxes) {
			tracked_image(imageFile, boxes);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [uuid, boxes, imageFile]);

	const handleImageChange = (event) => {
		const newImageFile = event.target.files[0];
		setImageFile(newImageFile);

		const data = new FormData();
		if (newImageFile) {
			data.append('image_file', newImageFile, 'image_file');
			fetch('http://127.0.0.1:5000/load_image', {
				method: 'POST',
				mode: 'cors',
				headers: {
					// 'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Request-Headers': '*',
					'Access-Control-Request-Method': '*',
				},
				body: data,
			})
				.then((response) => {
					if (response.ok) {
						return response.json();
					} else {
						throw new Error(
							`Failed to load image. HTTP status: ${response.status}`
						);
					}
				})
				.then((data) => {
					const { boxes, uuid } = data;
					setBoxes(boxes);
					setUuid(uuid);
				})
				.catch((error) => {
					console.error('Error:', error.message);
				});
		}
		// console.log("event", event.target.files[0]);
	};

	const tracked_image = (file, boxes) => {
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
			// console.log(uuid);
			upload_image(dataUrl, uuid);
			// return dataUrl;
		};
	};

	const upload_image = (file, uuid) => {
		fetch('http://127.0.0.1:5000/upload_image_supabase', {
			method: 'POST',
			mode: 'cors',
			headers: {
				// 'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Request-Headers': '*',
				'Access-Control-Request-Method': '*',
			},
			body: JSON.stringify({ file: file, uuid: uuid }),
		})
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				console.log(data.msg);
			})
			.catch((error) => {
				console.error('Error uploading image:', error);
			});
	};

	return (
		<div className="flex justify-center w-full">
			<div className="flex flex-col justify-center w-full px-10">
				<h1 className="text-3xl font-bold text-center my-4">
					Upload Image
				</h1>
				<input
					type="file"
					id="imageInput"
					accept="image/jpeg, image/png, image/jpg, image/webp"
					onChange={handleImageChange}
					className="file-input file-input-bordered max-w-xs mx-auto my-3"
				/>
				{/* <button className="btn-primary" onClick={loadImage}>
				Upload Image
			</button> */}
				<canvas className="w-full max-w-6xl my-5 mx-auto" ref={canvasRef} />
			</div>
		</div>
	);
};

export default UploadImageForm;
