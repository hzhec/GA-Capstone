import { useState } from 'react';
import { io } from 'socket.io-client';

const UploadVideoForm = () => {
	const [uuid, setUuid] = useState(null);
	const [isLoading, setIsLoading] = useState('');

	const socket = io('http://127.0.0.1:65432');

	const handleVideoChange = (event) => {
		const newVideoFile = event.target.files[0];
		setIsLoading('processing');

		if (newVideoFile) {
			socket.emit('upload_video_processing', newVideoFile);
			socket.on('video_process_completed', (data) => {
				const { uuid } = data;
				setUuid(uuid);
				setIsLoading('completed');
			});
		}
	};

	const isProcessing = isLoading === 'processing';
	const isCompleted = isLoading === 'completed';

	return (
		<div className="flex justify-center w-full">
			<div className="flex flex-col w-full justify-self-start mt-5">
				<h1 className="text-3xl font-bold text-center my-4">Upload Video</h1>
				<input
					type="file"
					id="videoInput"
					accept="video/mp4"
					onChange={handleVideoChange}
					className="file-input file-input-bordered  w-full max-w-xs mx-auto my-3"
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
