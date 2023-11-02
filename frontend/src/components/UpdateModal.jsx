import { useEffect, useRef, useState } from 'react';
import { useYoloContext } from './context/yolo-context';

const UpdateMedia = (props) => {
	const [isLoading, setIsLoading] = useState(false);
	const inputRef = useRef();
	const { notifySuccess } = useYoloContext();

	const mediaUrl =
		props.type === 'image'
			? `https://zzarsocediotoipqufrv.supabase.co/storage/v1/object/public/image-bucket/${props.uuid}.jpeg`
			: `https://zzarsocediotoipqufrv.supabase.co/storage/v1/object/public/video-bucket/${props.uuid}.mp4`;

	useEffect(() => {
		setIsLoading(true);
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 1500);
		return () => clearTimeout(timer);
	}, [props.uuid]);

	const updateHandler = () => {
		fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/updateName?mediaType=${props.type}`, {
			method: 'PUT',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Request-Headers': '*',
				'Access-Control-Request-Method': '*',
			},
			body: JSON.stringify({
				uuid: props.uuid,
				name: inputRef.current.value,
			}),
		})
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				notifySuccess(data.msg);
			})
			.catch((err) => {
				console.log(err);
			});

		props.handleToggle();
		props.refresh();
	};

	return (
		<>
			<dialog id="update-media" className="modal" open={props.open} onClose={props.handleToggle}>
				<div className="modal-box max-w-3xl">
					<h3 className="font-bold text-lg">Update Media</h3>
					<p className="py-4">Do you want to update the name of this media?</p>
					{isLoading ? (
						<div className="flex justify-center py-10 items-center">
							<span className="loading loading-spinner text-neutral"></span>
							<div className="text-lg mx-5">Loading</div>
						</div>
					) : props.uuid ? (
						<>
							<input
								type="text"
								placeholder="Name"
								className="input input-bordered w-full max-w-xs"
								ref={inputRef}
							/>
							{props.type == 'image' ? (
								<img src={mediaUrl} alt={`${props.uuid}`} className="py-4" />
							) : (
								<video src={mediaUrl} controls width="840" className="py-4" />
							)}
						</>
					) : null}
					<div className="btn-wrapper float-right">
						<button className="btn btn-ghost mr-2" onClick={props.handleToggle}>
							Cancel
						</button>
						<button className="btn btn-error text-white" onClick={updateHandler}>
							Update
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

export default UpdateMedia;
