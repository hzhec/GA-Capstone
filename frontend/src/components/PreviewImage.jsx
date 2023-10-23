import { useEffect, useState } from 'react';

const PreviewImage = (props) => {
	const [isLoading, setIsLoading] = useState(false);
	const image_link = `https://zzarsocediotoipqufrv.supabase.co/storage/v1/object/public/image-bucket/${props.uuid}.jpeg`;

	useEffect(() => {
		setIsLoading(true);
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 1200);
		return () => clearTimeout(timer);
	}, [props.uuid]);

	return (
		<>
			<dialog
				id="preview-image"
				className="modal"
				open={props.open}
				onClose={props.handleToggle}
			>
				<div className="modal-box max-w-4xl">
					<h3 className="font-bold text-lg">Result</h3>
					{isLoading ? (
						<div className="flex justify-center py-10 items-center">
							<span className="loading loading-spinner text-neutral"></span>
							<div className="text-2xl mx-5">Loading</div>
						</div>
					) : (
						<img src={image_link} alt={`${props.uuid}`} className="py-4" />
					)}
				</div>
				<form method="dialog" className="modal-backdrop">
					<button className="bg-slate-950/50">Close</button>
				</form>
			</dialog>
		</>
	);
};

export default PreviewImage;
