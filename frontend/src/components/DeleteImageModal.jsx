import { useEffect, useState } from 'react';
const DeleteImageModal = (props) => {
	const [isLoading, setIsLoading] = useState(false);
	const image_link = `https://zzarsocediotoipqufrv.supabase.co/storage/v1/object/public/image-bucket/${props.uuid}.jpeg`;

	useEffect(() => {
		setIsLoading(true);
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 1200);
		return () => clearTimeout(timer);
	}, [props.uuid]);

	const deleteHandler = () => {
		fetch('http://127.0.0.1:5000/delete_image', {
			method: 'DELETE',
			mode: 'cors',
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Request-Headers': '*',
				'Access-Control-Request-Method': '*',
			},
			body: JSON.stringify({
				uuid: props.uuid,
			}),
		})
			.then((response) => {
				return response.json();
			})
			.catch((error) => {
				console.error('Error deleting image:', error);
			});
		props.handleToggle();
	};

	return (
		<>
			<dialog id="delete-image" className="modal" open={props.open} onClose={props.handleToggle}>
				<div className="modal-box max-w-xl">
					<h3 className="font-bold text-lg">Delete Image</h3>
					<p className="py-4">Are you sure you want to delete this image?</p>
					{isLoading ? (
						<div className="flex justify-center py-10 items-center">
							<span className="loading loading-spinner text-neutral"></span>
							<div className="text-lg mx-5">Loading</div>
						</div>
					) : props.uuid ? (
						<img src={image_link} alt={`${props.uuid}`} className="py-4" />
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

export default DeleteImageModal;
