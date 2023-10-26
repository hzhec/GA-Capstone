import { useEffect, useState } from 'react';
import PreviewImage from './PreviewImage';
import DeleteImageModal from './DeleteImageModal';
import DeleteMultipleImages from './DeleteMultipleImages';
import { IoMdRefresh } from 'react-icons/io';

const ProcessedImages = () => {
	const [allImages, setAllImages] = useState();
	const [currentPage, setCurrentPage] = useState(1);
	const imagesPerPage = 10;
	const [showPreview, setShowPreview] = useState(false);
	const [showDelete, setShowDelete] = useState(false);
	const [showDeleteMultiple, setShowDeleteMultiple] = useState(false);
	const [previewUuid, setPreviewUuid] = useState();
	const [deleteUuid, setDeleteUuid] = useState();
	const [checkedImages, setCheckedImages] = useState([]);
	const [refresh, setRefresh] = useState(false);

	const idxOfLastImage = currentPage * imagesPerPage; // 1 * 10 = 10
	const idxOfFirstImage = idxOfLastImage - imagesPerPage; // 10 - 10 = 0

	useEffect(() => {
		fetch('http://127.0.0.1:65432/get_all_images')
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				// console.log(data.all_images);
				setAllImages(data.all_images);
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

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

	const previewImageHandler = (uuid) => {
		setPreviewUuid(uuid);
		openPreviewModal();
	};

	const checkboxChangeHandler = (event, uuid) => {
		if (event.target.checked) {
			setCheckedImages((prevCheckedImages) => [...prevCheckedImages, uuid]);
		} else {
			setCheckedImages((prevCheckedImages) => {
				return prevCheckedImages.filter((list_uuid) => list_uuid !== uuid);
			});
		}
	};

	const deleteImageHandler = (uuid) => {
		setDeleteUuid(uuid);
		openDeleteModal();
	};

	const deleteMultipleImagesHandler = () => {
		openDeleteMultipleModal();
	};

	const refreshHandler = () => {
		setRefresh(true);
		const timer = setTimeout(() => {
			fetch('http://127.0.0.1:65432/get_all_images')
				.then((response) => {
					return response.json();
				})
				.then((data) => {
					// console.log(data.all_images);
					setAllImages(data.all_images);
				})
				.catch((err) => {
					console.log(err);
				});
			setRefresh(false);
			clearTimeout(timer);
		}, 1000);
	};

	return (
		<div className="flex flex-col w-full">
			<div className="flex justify-between mt-7 mb-2 mx-8">
				<div className="flex items-center justify-center">
					<h1 className="text-xl mr-5">
						Processed Images {allImages && `(${allImages.length})`}
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
						htmlFor="delete-multiple-images"
						className="btn btn-error btn-xs text-white"
						disabled={checkedImages.length < 2}
						onClick={() => deleteMultipleImagesHandler(checkedImages)}
					>
						Delete Selected
					</label>
				</div>
			</div>
			<PreviewImage
				handleToggle={() => openPreviewModal()}
				open={showPreview}
				uuid={previewUuid}
			/>
			<DeleteImageModal
				handleToggle={() => openDeleteModal()}
				open={showDelete}
				uuid={deleteUuid}
				refresh={() => refreshHandler()}
			/>
			<DeleteMultipleImages
				handleToggle={() => openDeleteMultipleModal()}
				open={showDeleteMultiple}
				uuidArray={checkedImages}
				refresh={() => refreshHandler()}
			/>
			{allImages && (
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
								{allImages.slice(idxOfFirstImage, idxOfLastImage).map((image) => (
									<tr key={image.uuid}>
										<th>
											<label>
												<input
													type="checkbox"
													className="checkbox checkbox-sm"
													onChange={(event) =>
														checkboxChangeHandler(event, image.uuid)
													}
												/>
											</label>
										</th>
										<td>
											<div className="flex items-center">
												<div className="font-bold">{image.id}</div>
											</div>
										</td>
										<td>
											<div className="text-sm">{image.uuid}</div>
										</td>
										<td>{image['created_at']}</td>
										<td>
											<label
												htmlFor="preview-image"
												className="btn btn-xs"
												onClick={() => previewImageHandler(image.uuid)}
											>
												Preview
											</label>
										</td>
										<td>
											<div className="flex justify-center items-center">
												<label
													htmlFor="delete-image"
													className="btn btn-square btn-outline btn-xs btn-error"
													disabled={!checkedImages.includes(image.uuid)}
													onClick={() => deleteImageHandler(image.uuid)}
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
								disabled={allImages.length < 11}
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

export default ProcessedImages;