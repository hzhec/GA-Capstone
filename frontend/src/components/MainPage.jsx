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
							width="35%"
						/>
					</div>
				</div>
			</div>
		</>
	);
};

export default MainPage;
