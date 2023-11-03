import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYoloContext } from './context/yolo-context';

const NotFoundPage = () => {
	const navigate = useNavigate();
	const { notifyError } = useYoloContext();

	useEffect(() => {
		notifyError(`Navigating back to homepage in 5 seconds...`);
		const timer = setTimeout(() => {
			navigate('/');
		}, 4000);

		return () => clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<div className="flex w-full justify-items-center h-[65rem]">
				<div className="flex flex-col w-full text-center my-3">
					<div className="relative text-3xl font-bold text-slate-500 py-1 ">
						<img
							className="mask mask-rectangle mx-auto"
							src="https://zzarsocediotoipqufrv.supabase.co/storage/v1/object/public/logo-bucket/roboto-error.png"
						/>
						<h1 className="absolute inset-x-0 bottom-[4.5rem] font-['Chakra_Petch'] font-bold text-8xl width-full text-center animate-tilt-shaking">
							PAGE NOT FOUND
						</h1>
					</div>
				</div>
			</div>
		</>
	);
};

export default NotFoundPage;
