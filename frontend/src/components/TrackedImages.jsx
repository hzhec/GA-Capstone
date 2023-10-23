import { useEffect, useState } from 'react';
import PreviewImage from './PreviewImage';

const TrackedImages = () => {
	const [allImages, setAllImages] = useState();
	const [currentPage, setCurrentPage] = useState(1);
	const imagesPerPage = 10;
	const [showPreview, setShowPreview] = useState(false);
	const [uuid, setUuid] = useState();
	const [checkedImages, setCheckedImages] = useState([]);

	const idxOfLastImage = currentPage * imagesPerPage; // 1 * 10 = 10
	const idxOfFirstImage = idxOfLastImage - imagesPerPage; // 10 - 10 = 0

	useEffect(() => {
		fetch('http://127.0.0.1:5000/get_all_images')
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				// console.log(data.allimages);
				setAllImages(data.allimages);
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	const paginate = (pageNum) => setCurrentPage(pageNum);

	const openPreview = () => {
		setShowPreview((prev) => !prev);
	};

	const previewImageHandler = (uuid) => {
		setUuid(uuid);
		openPreview();
	};

	const checkboxChangeHandler = (event, imageUuid) => {
		if (event.target.checked) {
			setCheckedImages((prevCheckedImages) => [...prevCheckedImages, imageUuid]);
		} else {
			setCheckedImages((prevCheckedImages) =>
				prevCheckedImages.filter((uuid) => uuid !== imageUuid)
			);
		}
	};

	return (
		<div className="flex flex-col w-full">
			<PreviewImage handleToggle={() => openPreview()} open={showPreview} uuid={uuid} />
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
												className="btn btn-ghost btn-xs"
												onClick={() => previewImageHandler(image.uuid)}
											>
												Preview
											</label>
										</td>
										<td className="flex items-center justify-center">
											<button
												type="button"
												className="btn btn-square btn-outline btn-xs btn-error"
												disabled={!checkedImages.includes(image.uuid)}
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
											</button>
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

export default TrackedImages;
