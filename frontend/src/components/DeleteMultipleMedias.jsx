import { useYoloContext } from './context/yolo-context';

const DeleteMultipleMedias = (props) => {
	const { notifySuccess } = useYoloContext();

	const deleteHandler = () => {
		fetch(
			`${import.meta.env.VITE_APP_BACKEND_URL}/deleteMultipleMedias?mediaType=${props.type}`,
			{
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
			}
		)
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
