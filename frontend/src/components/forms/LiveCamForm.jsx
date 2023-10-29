import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { useYoloContext } from '../context/yolo-context';

const LiveCamForm = () => {
	const [videoUrl, setVideoUrl] = useState('');
	const [rtspUrl, setRtspUrl] = useState('');
	const [isConnected, setIsConnected] = useState(false);
	const [connectStatus, setConnectStatus] = useState(false);

	const socket = io('http://127.0.0.1:65432');
	const navigate = useNavigate();
	const { authToken, notifyError } = useYoloContext();

	useEffect(() => {
		if (!authToken.token) {
			notifyError('You are not logged in');
			navigate('/login');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (isConnected) {
			setConnectStatus(false);
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
		setConnectStatus(true);
		const timer = setTimeout(() => {
			setIsConnected(true);
			setConnectStatus(false);
		}, 1500);
		socket.emit('add_rtsp', { rtsp: rtspUrl });
		socket.emit('connect_live_cam');
		return () => {
			clearTimeout(timer);
		};
	};

	const disconnectHandler = () => {
		setIsConnected(false);
		setVideoUrl('');
		socket.emit('disconnect_live_cam');
	};

	return (
		<div className="flex justify-center w-full">
			<div className="flex flex-col w-full justify-self-start mt-5">
				<h1 className="text-3xl font-bold text-center my-4">Live Camera</h1>
				<div className="form-control w-full max-w-xs mx-auto flex flex-col justify-center">
					<div className="flex flex-row w-full">
						<input
							type="form"
							placeholder="rtsp://<ip-address>"
							className="input input-bordered w-full max-w-sm mx-1"
							onChange={inputChangeHandler}
						/>
						<button className="btn" onClick={connectHandler}>
							Connect
						</button>
					</div>
					<div>
						<label className="label">
							<span className="label-text text-xs mx-1">Type 0 to use webcam</span>
						</label>
					</div>
				</div>
				{connectStatus && (
					<div
						className="bg-neutral-focus w-[200px] rounded-lg text-white font-bold duration-[500ms,800ms] my-20 mx-auto"
						disabled
					>
						<div className="flex items-center justify-center m-[10px]">
							<div className="h-5 w-5 border-t-transparent border-solid animate-spin rounded-full border-white border-4"></div>
							<div className="ml-2"> Connecting...</div>
						</div>
					</div>
				)}
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
