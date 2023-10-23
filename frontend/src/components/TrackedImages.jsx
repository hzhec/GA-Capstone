import { useEffect, useState } from 'react';

const TrackedImages = () => {
	const [allImages, setAllImages] = useState();
	const [currentPage, setCurrentPage] = useState(1);
	const imagesPerPage = 10;

	const idxOfLastImage = currentPage * imagesPerPage; // 1 * 10 = 10
	const idxOfFirstImage = idxOfLastImage - imagesPerPage; // 10 - 10 = 0

	useEffect(() => {
		fetch('http://127.0.0.1:5000/get_all_images')
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				console.log(data.allimages);
				setAllImages(data.allimages);
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	const paginate = (pageNum) => setCurrentPage(pageNum);

	return (
		<div className="flex flex-col w-full">
			{allImages && (
				<div className="p-5">
					<div className="overflow-x-auto">
						<table className="table w-full mb-8">
							<thead>
								<tr>
									<th>Id</th>
									<th>Uuid</th>
									<th>Uploaded Date</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{allImages.slice(idxOfFirstImage, idxOfLastImage).map((image) => (
									<tr key={image.uuid}>
										{/* <th>
											<label>
												<input type="checkbox" className="checkbox" />
											</label>
										</th> */}
										<td>
											<div className="flex items-center space-x-3">
												<div className="font-bold">{image.id}</div>
											</div>
										</td>
										<td>
											<div className="text-sm">{image.uuid}</div>
										</td>
										<td>{image['created_at']}</td>
										<th>
											<button className="btn btn-ghost btn-xs">Preview</button>
										</th>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div className="flex justify-center">
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
