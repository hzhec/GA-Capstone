import { useEffect, useState, useRef } from 'react';
import { useYoloContext } from '../context/yolo-context';
import { useNavigate } from 'react-router-dom';
import classArray from '../classes-data';

const UploadImageForm = () => {
	const canvasRef = useRef(null);
	const selectRef = useRef(null);
	const inputRef = useRef(null);
	const [uuid, setUuid] = useState(null);
	const [imageFile, setImageFile] = useState(null);
	const [boxes, setBoxes] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	const navigate = useNavigate();
	const { authToken, notifyError, notifySuccess } = useYoloContext();

	useEffect(() => {
		if (!authToken.token) {
			notifyError('You are not logged in');
			navigate('/login');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (boxes != null) {
			processImage(imageFile, boxes);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [boxes]);

	const handleImageChange = (event) => {
		const newImageFile = event.target.files[0];
		setImageFile(newImageFile);
		const selectedClass = selectRef.current.value;
		setIsLoading(false);
		setBoxes(null);
		setUuid(null);

		const data = new FormData();

		if (newImageFile) {
			data.append('imageFile', newImageFile, 'imageFile');
			data.append('userId', authToken.id);
			data.append('className', selectedClass);
			fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/upload_image_processing`, {
				method: 'POST',
				mode: 'cors',
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Request-Headers': '*',
					'Access-Control-Request-Method': '*',
				},
				body: data,
			})
				.then((response) => {
					return response.json();
				})
				.then((data) => {
					const { boxes, uuid, status } = data;
					if (status === 'success') {
						setBoxes(boxes);
						setUuid(uuid);
						setIsLoading(true);
						notifySuccess(data.msg);
					} else {
						notifyError(data.msg);
					}
				})
				.catch((error) => {
					console.log(error);
				});
		}
		inputRef.current.value = null;
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
			if (boxes.length > 0) {
				upload_image(dataUrl, uuid);
			}
		};
	};

	const upload_image = (file, uuid) => {
		const image_data = file.split(',')[1].replace(' ', '+');
		fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/upload_to_supabase`, {
			method: 'POST',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Request-Headers': '*',
				'Access-Control-Request-Method': '*',
			},
			body: JSON.stringify({
				processed_file: image_data,
				uuid: uuid,
			}),
		})
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				console.log(data);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const classes = classArray.map((class_name) => {
		return <option key={class_name}>{class_name}</option>;
	});

	return (
		<div className="flex justify-center w-full">
			<div className="flex flex-col w-full justify-self-start mt-5">
				<h1 className="text-3xl font-bold text-center my-4">Upload Image</h1>
				<select className="select select-bordered w-full max-w-xs mx-auto" ref={selectRef}>
					<option key="none" value="none">
						Select a class
					</option>
					{classes}
				</select>
				<input
					type="file"
					id="imageInput"
					accept="image/jpeg, image/png, image/jpg, image/webp"
					onChange={handleImageChange}
					className="file-input file-input-bordered w-full max-w-xs mx-auto my-3"
					ref={inputRef}
				/>
				{isLoading && <canvas className="w-full max-w-6xl my-5 mx-auto" ref={canvasRef} />}
			</div>
		</div>
	);
};

export default UploadImageForm;
