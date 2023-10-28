import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
const DeleteMediaModal = (props) => {
	const [isLoading, setIsLoading] = useState(false);
	const socket = io('http://127.0.0.1:65432');
	const mediaUrl =
		props.type === 'images'
			? `https://zzarsocediotoipqufrv.supabase.co/storage/v1/object/public/image-bucket/${props.uuid}.jpeg`
			: `https://zzarsocediotoipqufrv.supabase.co/storage/v1/object/public/video-bucket/${props.uuid}.mp4`;

	useEffect(() => {
		setIsLoading(true);
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 1200);
		return () => clearTimeout(timer);
	}, [props.uuid]);

	const deleteHandler = () => {
		socket.emit(props.type === 'images' ? 'delete_image' : 'delete_video', { uuid: props.uuid });

		props.handleToggle();
		props.refresh();
	};

	return (
		<>
			<dialog id="delete-image" className="modal" open={props.open} onClose={props.handleToggle}>
				<div className="modal-box max-w-3xl">
					<h3 className="font-bold text-lg">Delete Media</h3>
					<p className="py-4">Are you sure you want to delete this media?</p>
					{isLoading ? (
						<div className="flex justify-center py-10 items-center">
							<span className="loading loading-spinner text-neutral"></span>
							<div className="text-lg mx-5">Loading</div>
						</div>
					) : props.uuid ? (
						props.type == 'images' ? (
							<img src={mediaUrl} alt={`${props.uuid}`} className="py-4" />
						) : (
							<video src={mediaUrl} controls width="840" className="py-4" />
						)
					) : null}
					<div className="btn-wrapper float-right">
						<button className="btn btn-ghost mr-2" onClick={props.handleToggle}>
							Cancel
						</button>
						<button className="btn btn-error text-white" onClick={deleteHandler}>
							Delete
						</button>
					</div>
				</div>
				<form method="dialog" className="modal-backdrop">
					<button className="bg-slate-950/50">Close</button>
				</form>
			</dialog>
		</>
	);
};

export default DeleteMediaModal;
