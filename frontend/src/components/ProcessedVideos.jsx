import { useEffect, useState } from 'react';
import PreviewMedia from './PreviewMedia';
import DeleteMediaModal from './DeleteMediaModal';
import DeleteMultipleMedias from './DeleteMultipleMedias';
import { IoMdRefresh } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { useYoloContext } from './context/yolo-context';
import UpdateMedia from './UpdateModal';

const ProcessedVideos = () => {
	const [allVideos, setAllVideos] = useState();
	const [currentPage, setCurrentPage] = useState(1);
	const VideosPerPage = 10;
	const [showPreview, setShowPreview] = useState(false);
	const [showUpdate, setShowUpdate] = useState(false);
	const [showDelete, setShowDelete] = useState(false);
	const [showDeleteMultiple, setShowDeleteMultiple] = useState(false);
	const [previewUuid, setPreviewUuid] = useState();
	const [deleteUuid, setDeleteUuid] = useState();
	const [updateUuid, setUpdateUuid] = useState();
	const [checkedVideos, setCheckedVideos] = useState([]);
	const [refresh, setRefresh] = useState(false);

	const idxOfLastVideo = currentPage * VideosPerPage; // 1 * 10 = 10
	const idxOfFirstVideo = idxOfLastVideo - VideosPerPage; // 10 - 10 = 0

	const navigate = useNavigate();
	const { authToken, notifyError } = useYoloContext();

	useEffect(() => {
		if (!authToken.token) {
			notifyError('You are not logged in');
			navigate('/login');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		getAllVideos();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const getAllVideos = () => {
		// console.log(authToken);
		fetch(
			`${import.meta.env.VITE_APP_BACKEND_URL}/getAll?mediaType=video&user=${authToken.username}`
		)
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				setAllVideos(data.all_data);
			})
			.catch((error) => {
				console.log(error);
			});
	};

	const paginate = (pageNum) => setCurrentPage(pageNum);

	const openPreviewModal = () => {
		setShowPreview((prev) => !prev);
	};

	const openUpdateModal = () => {
		setShowUpdate((prev) => !prev);
	};

	const openDeleteModal = () => {
		setShowDelete((prev) => !prev);
	};

	const openDeleteMultipleModal = () => {
		setShowDeleteMultiple((prev) => !prev);
	};

	const previewVideoHandler = (uuid) => {
		setPreviewUuid(uuid);
		openPreviewModal();
	};

	const updateHandler = (uuid) => {
		setUpdateUuid(uuid);
		openUpdateModal();
	};

	const checkboxChangeHandler = (event, uuid) => {
		if (event.target.checked) {
			setCheckedVideos((prevCheckedVideos) => [...prevCheckedVideos, uuid]);
		} else {
			setCheckedVideos((prevCheckedVideos) => {
				return prevCheckedVideos.filter((list_uuid) => list_uuid !== uuid);
			});
		}
	};

	const deleteVideoHandler = (uuid) => {
		setDeleteUuid(uuid);
		openDeleteModal();
	};

	const deleteMultipleVideosHandler = () => {
		openDeleteMultipleModal();
	};

	const refreshHandler = () => {
		setRefresh(true);
		const timer = setTimeout(() => {
			getAllVideos();
			setRefresh(false);
			clearTimeout(timer);
		}, 800);
	};

	return (
		<div className="flex flex-col w-full">
			<div className="flex justify-between mt-7 mb-4 mx-8">
				<div className="flex items-center justify-center">
					<h1 className="text-2xl mr-5">
						Processed Videos {allVideos && `(${allVideos.length})`}
					</h1>
					{!refresh ? (
						<div className="text-2xl" onClick={refreshHandler}>
							<IoMdRefresh />
						</div>
					) : (
						<span className="loading loading-spinner loading-sm"></span>
					)}
				</div>
				<div className="flex justify-center items-center my-auto">
					<label
						htmlFor="delete-multiple-medias"
						className="btn btn-error btn-xs text-white"
						disabled={checkedVideos.length < 2}
						onClick={() => deleteMultipleVideosHandler(checkedVideos)}
					>
						Delete Selected
					</label>
				</div>
			</div>
			<PreviewMedia
				handleToggle={openPreviewModal}
				open={showPreview}
				uuid={previewUuid}
				refresh={refreshHandler}
				type="video"
			/>
			<UpdateMedia
				handleToggle={openUpdateModal}
				open={showUpdate}
				uuid={updateUuid}
				refresh={refreshHandler}
				type="video"
			/>
			<DeleteMediaModal
				handleToggle={openDeleteModal}
				open={showDelete}
				uuid={deleteUuid}
				refresh={refreshHandler}
				type="video"
			/>
			<DeleteMultipleMedias
				handleToggle={openDeleteMultipleModal}
				open={showDeleteMultiple}
				uuidArray={checkedVideos}
				refresh={refreshHandler}
				type="video"
			/>
			{allVideos && (
				<div className="p-5">
					<div className="overflow-x-auto">
						<table className="table w-full mb-8 items-center">
							<thead>
								<tr>
									<th></th>
									<th>Id</th>
									<th>Uuid</th>
									<th>Name</th>
									<th>Uploaded Date</th>
									<th></th>
									<th></th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{allVideos.slice(idxOfFirstVideo, idxOfLastVideo).map((video) => (
									<tr key={video.uuid}>
										<th>
											<label>
												<input
													type="checkbox"
													className="checkbox checkbox-sm"
													onChange={(event) =>
														checkboxChangeHandler(event, video.uuid)
													}
												/>
											</label>
										</th>
										<td>
											<div className="flex items-center">
												<div className="font-bold">{video.id}</div>
											</div>
										</td>
										<td>
											<div className="text-sm">{video.uuid}</div>
										</td>
										<td>
											<div className="text-sm">{video.video_name}</div>
										</td>
										<td>{video['created_at']}</td>
										<td>
											<label
												htmlFor="update-media"
												className="btn btn-xs"
												onClick={() => updateHandler(video.uuid)}
											>
												Update
											</label>
										</td>
										<td>
											<label
												htmlFor="preview-media"
												className="btn btn-xs"
												onClick={() => previewVideoHandler(video.uuid)}
											>
												Preview
											</label>
										</td>
										<td>
											<div className="flex justify-center items-center">
												<label
													htmlFor="delete-media"
													className="btn btn-square btn-outline btn-xs btn-error"
													disabled={!checkedVideos.includes(video.uuid)}
													onClick={() => deleteVideoHandler(video.uuid)}
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														className="h-6 w-6"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2"
															d="M6 18L18 6M6 6l12 12"
														/>
													</svg>
												</label>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div className="flex justify-center my-5">
						<div className="join">
							<button
								className="join-item btn btn-sm"
								disabled={currentPage === 1}
								onClick={() => paginate(currentPage - 1)}
							>
								«
							</button>
							<button className="join-item btn btn-sm" onClick={() => paginate(1)}>
								Page {currentPage}
							</button>
							<button
								className="join-item btn btn-sm"
								disabled={allVideos.length < 11}
								onClick={() => paginate(currentPage + 1)}
							>
								»
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ProcessedVideos;
