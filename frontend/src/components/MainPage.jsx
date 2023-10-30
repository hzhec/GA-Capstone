import { Toaster } from 'react-hot-toast';

const MainPage = () => {
	return (
		<>
			<Toaster />
			<div className="flex ml-4 w-full justify-items-center h-[65rem]">
				<div className="flex flex-col w-full text-center my-10">
					<div className="text-3xl font-bold text-slate-500 py-1 my-10 ">
						YOLO (You Only Look Once) <br />a real-time object detection algorithm
					</div>
				</div>
			</div>
		</>
	);
};

export default MainPage;
