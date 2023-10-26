import { useState } from 'react';

const UploadVideoForm = () => {
	const [uuid, setUuid] = useState(null);
	const [isLoading, setIsLoading] = useState('');

	const handleVideoChange = (event) => {
		const newVideoFile = event.target.files[0];
		setIsLoading('processing');
		const data = new FormData();

		if (newVideoFile) {
			data.append('video_file', newVideoFile, 'video_file');
			fetch('http://127.0.0.1:65432/load_video', {
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
						throw new Error(`Failed to load video. HTTP status: ${response.status}`);
					}
				})
				.then((data) => {
					const { uuid } = data;
					setUuid(uuid);
					setIsLoading('completed');
				})
				.catch((error) => {
					console.error('Error:', error.message);
				});
		}
	};

	return (
		<div className="flex justify-center w-full">
			<div className="flex flex-col justify-center w-full px-10">
				<h1 className="text-3xl font-bold text-center my-4">Upload Video</h1>
				<input
					type="file"
					id="videoInput"
					accept="video/mp4"
					onChange={handleVideoChange}
					className="file-input file-input-bordered  w-full max-w-xs mx-auto my-3"
				/>
				<div className="flex justify-center w-full">
					{isLoading == 'processing' && (
						<div
							type="button"
							className="bg-neutral-focus w-[200px] rounded-lg text-white font-bold duration-[500ms,800ms]"
							disabled
						>
							<div className="flex items-center justify-center m-[10px]">
								<div className="h-5 w-5 border-t-transparent border-solid animate-spin rounded-full border-white border-4"></div>
								<div className="ml-2"> Processing...</div>
							</div>
						</div>
					)}
					{isLoading == 'completed' && (
						<video
							autoPlay
							controls
							width="840"
							src={`https://zzarsocediotoipqufrv.supabase.co/storage/v1/object/public/video-bucket/${uuid}.mp4`}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default UploadVideoForm;
