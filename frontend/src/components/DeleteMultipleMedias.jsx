import { io } from 'socket.io-client';

const DeleteMultipleMedias = (props) => {
	const socket = io('http://127.0.0.1:65432');
	let endpoint = '';

	if (props.type == 'images') {
		endpoint = 'delete_multiple_images';
	} else {
		endpoint = 'delete_multiple_videos';
	}

	const deleteHandler = () => {
		socket.emit(endpoint, { uuid: props.uuidArray });
		props.handleToggle();
		props.refresh();
	};

	return (
		<>
			<dialog
				id="delete-multiple-images"
				className="modal"
				open={props.open}
				onClose={props.handleToggle}
			>
				<div className="modal-box max-w-xl">
					<h3 className="font-bold text-lg">Delete Medias</h3>
					<p className="py-4">Are you sure you want to delete the selected medias?</p>
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

export default DeleteMultipleMedias;
