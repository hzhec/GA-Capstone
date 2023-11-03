import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYoloContext } from '../context/yolo-context';

const UploadVideoForm = () => {
	const inputRef = useRef(null);
	const [uuid, setUuid] = useState(null);
	const [isLoading, setIsLoading] = useState('');

	const navigate = useNavigate();
	const { authToken, notifyError, notifySuccess } = useYoloContext();

	useEffect(() => {
		if (!authToken.token) {
			notifyError('You are not logged in');
			navigate('/login');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleVideoChange = (event) => {
		const newVideoFile = event.target.files[0];
		setIsLoading('processing');

		const data = new FormData();

		if (newVideoFile) {
			data.append('videoFile', newVideoFile, 'videoFile');
			data.append('userId', authToken.id);
			fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/upload_video_processing`, {
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
					const { uuid } = data;
					setUuid(uuid);
					setIsLoading('completed');
					notifySuccess(data.msg);
				})
				.catch((error) => {
					console.log(error);
				});
		}
		inputRef.current.value = null;
	};

	const isProcessing = isLoading === 'processing';
	const isCompleted = isLoading === 'completed';

	return (
		<div className="flex justify-center w-full">
			<div className="flex flex-col w-full justify-self-start mt-5">
				<img
					src="https://zzarsocediotoipqufrv.supabase.co/storage/v1/object/public/logo-bucket/robot-search-2.png"
					alt="robot-search"
					className="mx-auto"
					width="150px"
				/>
				<h1 className="text-3xl font-bold text-center my-4">Upload Video</h1>
				<input
					type="file"
					id="videoInput"
					accept="video/mp4"
					onChange={handleVideoChange}
					className="file-input file-input-bordered  w-full max-w-xs mx-auto my-3"
					ref={inputRef}
				/>
				<div className="flex justify-center w-full">
					{isProcessing && (
						<div
							className="bg-neutral-focus w-[200px] rounded-lg text-white font-bold duration-[500ms,800ms] my-20"
							disabled
						>
							<div className="flex items-center justify-center m-[10px]">
								<div className="h-5 w-5 border-t-transparent border-solid animate-spin rounded-full border-white border-4"></div>
								<div className="ml-2"> Processing...</div>
							</div>
						</div>
					)}
					{isCompleted && (
						<video
							autoPlay
							controls
							width="840"
							className="my-10"
							src={`https://zzarsocediotoipqufrv.supabase.co/storage/v1/object/public/video-bucket/${uuid}.mp4`}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default UploadVideoForm;
