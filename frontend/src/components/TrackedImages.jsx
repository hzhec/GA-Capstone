import { useEffect, useState } from 'react';

const TrackedImages = () => {
	const [allImages, setAllImages] = useState();

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

	return (
		<>
			<ul>
				{allImages &&
					allImages.map((image) => <li key={image.id}>{image.uuid}</li>)}
			</ul>
		</>
	);
};

export default TrackedImages;
