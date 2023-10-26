import { useEffect, useState } from 'react';

const PreviewMedia = (props) => {
	const [isLoading, setIsLoading] = useState(false);
	let mediaLink = '';

	if (props.type == 'images') {
		mediaLink = `https://zzarsocediotoipqufrv.supabase.co/storage/v1/object/public/image-bucket/${props.uuid}.jpeg`;
	} else {
		mediaLink = `https://zzarsocediotoipqufrv.supabase.co/storage/v1/object/public/video-bucket/${props.uuid}.mp4`;
	}

	useEffect(() => {
		setIsLoading(true);
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 1500);
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
					) : props.uuid ? (
						props.type == 'images' ? (
							<img src={mediaLink} alt={`${props.uuid}`} className="py-4" />
						) : (
							<video src={mediaLink} autoPlay controls width="840" className="py-4" />
						)
					) : null}
				</div>
				<form method="dialog" className="modal-backdrop">
					<button className="bg-slate-950/50">Close</button>
				</form>
			</dialog>
		</>
	);
};

export default PreviewMedia;
