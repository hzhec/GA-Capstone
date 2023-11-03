import { Toaster } from 'react-hot-toast';

const MainPage = () => {
	return (
		<>
			<Toaster />
			<div className="flex ml-4 w-full justify-items-center h-[65rem]">
				<div className="flex flex-col w-full text-center">
					<div className="text-3xl font-bold text-slate-500 py-1">
						<img
							className="mx-auto rounded-3xl "
							src="https://zzarsocediotoipqufrv.supabase.co/storage/v1/object/public/logo-bucket/robot-chat-yolov8.png"
							width="30%"
						/>
						<div className="w-[70%] mx-auto my-10 text-xl bg-blue-50 p-5 rounded-3xl">
							<span>
								Ultralytics YOLO v8 is a real-time objection detection model. It divides an
								image into a grid and predicts bounding boxes and class probabilities for
								objects in each grid cell.
							</span>
							<br />
							<br />
							<span>- To start, register or login to an account. </span>
							<br />
							<span>
								- Either connect to live camera (Webcam or RTSP link) <br />
								or upload image/video to start the object detection.
							</span>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default MainPage;
