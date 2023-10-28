import { useEffect, useState } from 'react';
import PreviewMedia from './PreviewMedia';
import DeleteMediaModal from './DeleteMediaModal';
import DeleteMultipleMedias from './DeleteMultipleMedias';
import { IoMdRefresh } from 'react-icons/io';
import { io } from 'socket.io-client';

const ProcessedVideos = () => {
	const [allVideos, setAllVideos] = useState();
	const [currentPage, setCurrentPage] = useState(1);
	const VideosPerPage = 10;
	const [showPreview, setShowPreview] = useState(false);
	const [showDelete, setShowDelete] = useState(false);
	const [showDeleteMultiple, setShowDeleteMultiple] = useState(false);
	const [previewUuid, setPreviewUuid] = useState();
	const [deleteUuid, setDeleteUuid] = useState();
	const [checkedVideos, setCheckedVideos] = useState([]);
	const [refresh, setRefresh] = useState(false);

	const idxOfLastVideo = currentPage * VideosPerPage; // 1 * 10 = 10
	const idxOfFirstVideo = idxOfLastVideo - VideosPerPage; // 10 - 10 = 0

	const socket = io('http://127.0.0.1:65432');

	useEffect(() => {
		getAllVideos();
		return () => {
			socket.disconnect();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const getAllVideos = () => {
		socket.emit('get_all_videos');
		socket.on('all_videos', (data) => {
			setAllVideos(data.all_videos);
		});
	};

	const paginate = (pageNum) => setCurrentPage(pageNum);

	const openPreviewModal = () => {
		setShowPreview((prev) => !prev);
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
		}, 1000);
	};

	return (
		<div className="flex flex-col w-full">
			<div className="flex justify-between mt-7 mb-2 mx-8">
				<div className="flex items-center justify-center">
					<h1 className="text-xl mr-5">
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
						htmlFor="delete-multiple-Videos"
						className="btn btn-error btn-xs text-white"
						disabled={checkedVideos.length < 2}
						onClick={() => deleteMultipleVideosHandler(checkedVideos)}
					>
						Delete Selected
					</label>
				</div>
			</div>
			<PreviewMedia
				handleToggle={() => openPreviewModal()}
				open={showPreview}
				uuid={previewUuid}
				type="videos"
			/>
			<DeleteMediaModal
				handleToggle={() => openDeleteModal()}
				open={showDelete}
				uuid={deleteUuid}
				refresh={() => refreshHandler()}
				type="videos"
			/>
			<DeleteMultipleMedias
				handleToggle={() => openDeleteMultipleModal()}
				open={showDeleteMultiple}
				uuidArray={checkedVideos}
				refresh={() => refreshHandler()}
				type="videos"
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
									<th>Uploaded Date</th>
									<th></th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{allVideos.slice(idxOfFirstVideo, idxOfLastVideo).map((Video) => (
									<tr key={Video.uuid}>
										<th>
											<label>
												<input
													type="checkbox"
													className="checkbox checkbox-sm"
													onChange={(event) =>
														checkboxChangeHandler(event, Video.uuid)
													}
												/>
											</label>
										</th>
										<td>
											<div className="flex items-center">
												<div className="font-bold">{Video.id}</div>
											</div>
										</td>
										<td>
											<div className="text-sm">{Video.uuid}</div>
										</td>
										<td>{Video['created_at']}</td>
										<td>
											<label
												htmlFor="preview-Video"
												className="btn btn-xs"
												onClick={() => previewVideoHandler(Video.uuid)}
											>
												Preview
											</label>
										</td>
										<td>
											<div className="flex justify-center items-center">
												<label
													htmlFor="delete-Video"
													className="btn btn-square btn-outline btn-xs btn-error"
													disabled={!checkedVideos.includes(Video.uuid)}
													onClick={() => deleteVideoHandler(Video.uuid)}
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
							<button className="join-item btn btn-sm">Page {currentPage}</button>
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
