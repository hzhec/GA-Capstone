import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYoloContext } from '../context/yolo-context';

const LiveCamForm = () => {
	const rtspRef = useRef();
	const [isConnected, setIsConnected] = useState(false);
	const [connectStatus, setConnectStatus] = useState(false);

	const navigate = useNavigate();
	const { authToken, notifyError, notifySuccess } = useYoloContext();
	const liveStreamUrl = `${import.meta.env.VITE_APP_BACKEND_URL}/start_stream`;

	useEffect(() => {
		if (!authToken.token) {
			notifyError('You are not logged in');
			navigate('/login');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const connectHandler = () => {
		setConnectStatus(true);
		fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/add_rtsp`, {
			method: 'POST',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Request-Headers': '*',
				'Access-Control-Request-Method': '*',
			},
			body: JSON.stringify({ rtsp: rtspRef.current.value, userId: authToken.id }),
		})
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				notifySuccess(data.msg);
			})
			.catch((error) => {
				console.log(error);
			});

		setTimeout(() => {
			setIsConnected(true);
			setConnectStatus(false);
		}, 5000);
	};

	const disconnectHandler = () => {
		setIsConnected(false);
		fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/stop_stream`)
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				notifySuccess(data.msg);
			})
			.catch((error) => {
				console.log(error);
			});
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
							ref={rtspRef}
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
					{isConnected && <img src={liveStreamUrl} alt="RTSP Stream" width="70%" />}
				</div>
				{isConnected && (
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
