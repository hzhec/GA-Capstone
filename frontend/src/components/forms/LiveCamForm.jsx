import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const LiveCamForm = () => {
	const [videoUrl, setVideoUrl] = useState('');
	const [rtspUrl, setRtspUrl] = useState('');
	const [isConnected, setIsConnected] = useState(false);

	const socket = io('http://127.0.0.1:65432');

	useEffect(() => {
		if (isConnected) {
			socket.on('video_frame', (data) => {
				setVideoUrl(`data:image/jpeg;base64,${data.image}`);
			});
		}

		return () => {
			socket.disconnect();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isConnected]);

	const inputChangeHandler = (event) => {
		event.preventDefault();
		setRtspUrl(event.target.value);
	};

	const connectHandler = () => {
		setIsConnected(true);
		socket.emit('add_rtsp', { rtsp: rtspUrl });
		socket.emit('connect_live_cam');
	};

	const disconnectHandler = () => {
		setIsConnected(false);
		setVideoUrl('');
		socket.emit('disconnect_live_cam');
	};

	return (
		<div className="flex justify-center w-full">
			<div className="flex flex-col justify-center w-full px-10">
				<h1 className="text-3xl font-bold text-center my-4">Live Camera</h1>
				<div className="form-control w-full max-w-xs mx-auto flex flex-row justify-center">
					<input
						type="form"
						placeholder="rtsp://<ip-address>"
						className="input input-bordered w-full max-w-xs"
						onChange={inputChangeHandler}
					/>
					<button className="btn" onClick={connectHandler}>
						Connect
					</button>
				</div>
				<div className="flex justify-center w-full mx-auto my-10">
					{videoUrl && <img src={videoUrl} alt="RTSP Stream" width="65%" />}
				</div>
				{videoUrl && (
					<div className="flex justify-center">
						<button className="btn" onClick={disconnectHandler}>
							Disconnect
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default LiveCamForm;
