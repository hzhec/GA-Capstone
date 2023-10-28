import { useNavigate } from 'react-router-dom';
import { useYoloContext } from './context/yolo-context';
import { useEffect } from 'react';

const MainPage = () => {
	const navigate = useNavigate();
	const { authToken } = useYoloContext();

	useEffect(() => {
		if (!authToken.token) {
			navigate('/login');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="flex ml-4 w-full justify-items-center">
			<div className="flex flex-col justify-center w-full text-center ">
				<div className="text-3xl font-bold text-slate-500 py-1 my-10 ">
					YOLO (You Only Look Once) <br />a real-time object detection algorithm
				</div>
			</div>
		</div>
	);
};

export default MainPage;
