const DeleteMultipleMedias = (props) => {
	let endpoint = '';

	if (props.type == 'images') {
		endpoint = 'delete_multiple_images';
	} else {
		endpoint = 'delete_multiple_videos';
	}

	const deleteHandler = () => {
		fetch(`http://127.0.0.1:65432/${endpoint}`, {
			method: 'DELETE',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Request-Headers': '*',
				'Access-Control-Request-Method': '*',
			},
			body: JSON.stringify({
				uuidArray: props.uuidArray,
			}),
		})
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				console.log(data);
			})
			.catch((err) => {
				console.log(err);
			});
		props.handleToggle();
		props.refresh();
	};

	return (
		<>
			<dialog
				id="delete-multiple-medias"
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
