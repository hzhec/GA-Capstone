const DeleteMultipleImages = (props) => {
	const deleteHandler = () => {
		fetch('http://127.0.0.1:5000/delete_multiple_images', {
			method: 'DELETE',
			mode: 'cors',
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Request-Headers': '*',
				'Access-Control-Request-Method': '*',
			},
			body: JSON.stringify({
				uuid: props.uuidArray,
			}),
		})
			.then((response) => {
				return response.json();
			})
			.catch((error) => {
				console.error('Error deleting image:', error);
			});
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
					<h3 className="font-bold text-lg">Delete Images</h3>
					<p className="py-4">Are you sure you want to delete the selected images?</p>
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

export default DeleteMultipleImages;
