import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useYoloContext } from './context/yolo-context';

const StatsBanner = () => {
	const socket = io('http://127.0.0.1:65432');
	const { authToken } = useYoloContext();
	const [stats, setStats] = useState({});

	useEffect(() => {
		getImagesLength();
		getVideosLength();
		return () => {
			socket.off();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const getImagesLength = () => {
		socket.emit('get_all_images', { userId: authToken.id });
		socket.on('all_images', (data) => {
			setStats((prevState) => {
				return {
					...prevState,
					images: data.all_images.length,
				};
			});
		});
	};

	const getVideosLength = () => {
		socket.emit('get_all_videos', { userId: authToken.id });
		socket.on('all_videos', (data) => {
			setStats((prevState) => {
				return {
					...prevState,
					videos: data.all_videos.length,
				};
			});
		});
	};

	return (
		<div className="my-5">
			<div className="stats shadow">
				<div className="stat place-items-center">
					<div className="stat-title">No. of Images Uploaded</div>
					<div className="stat-value mt-3">{stats.images}</div>
				</div>

				<div className="stat place-items-center">
					<div className="stat-title">No. of Video Uploaded</div>
					<div className="stat-value mt-3">{stats.videos}</div>
				</div>
			</div>
		</div>
	);
};

export default StatsBanner;
