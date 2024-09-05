// Function to add a new product
function addProduct(name, image, price, description) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    let newId = products.length ? products[products.length - 1].id + 1 : 1;

    let newProduct = {
        id: newId,
        name: name,
        image: image,
        price: parseFloat(price),
        description: description,
        reviews: []
    };

    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
}

// Function to display product list
function displayProducts(query = '', sortBy = 'price') {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    let productList = document.getElementById('productList');
    let noResults = document.getElementById('noResults');

    productList.innerHTML = '';
    let filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase())
    );

    if (sortBy === 'price') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'rating') {
        filteredProducts.sort((a, b) => calculateAverageRating(b.reviews) - calculateAverageRating(a.reviews));
    }

    if (filteredProducts.length === 0) {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
        filteredProducts.forEach((product) => {
            let averageRating = calculateAverageRating(product.reviews);
            let stars = getStars(averageRating);
            let productItem = `
                <div class="product-item">
                    <h2><a href="product.html?id=${product.id}">${product.name}</a></h2>
                    <img src="${product.image}" alt="Product Image">
                    <p>Price: IDR ${product.price.toLocaleString()}</p>
                    <p>Average Rating: ${stars}</p>
                </div>
            `;
            productList.innerHTML += productItem;
        });
    }
}

// Function to display product details
function displayProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'), 10);

    if (isNaN(productId)) {
        console.error('Invalid product ID:', productId);
        return;
    }

    let products = JSON.parse(localStorage.getItem('products')) || [];
    let product = products.find(p => p.id === productId);

    if (!product) {
        console.error('Product not found:', productId);
        return;
    }

    document.getElementById('productDetails').innerHTML = `
        <h1>${product.name}</h1>
        <img src="${product.image}" alt="Product Image">
        <p>${product.description}</p>
        <p>Price: IDR ${product.price.toLocaleString()}</p>
        <p>Average Rating: ${getStars(calculateAverageRating(product.reviews))}</p>
    `;

    let reviewList = document.getElementById('productReviews');
    reviewList.innerHTML = '';

    product.reviews.forEach((review, reviewIndex) => {
        let reviewItem = `
            <div class="review-item" id="review-${reviewIndex}">
                <p>Rating: ${getStars(review.rating)}</p>
                <p>${review.text}</p>
                <button onclick="editReview(${productId}, ${reviewIndex})">Edit</button>
                <button onclick="deleteReview(${productId}, ${reviewIndex})">Delete</button>
            </div>
        `;
        reviewList.innerHTML += reviewItem;
    });

    document.getElementById('formTitle').textContent = reviewIndexToEdit !== null ? 'Edit Review' : 'Add Review';
    document.getElementById('submitButton').textContent = reviewIndexToEdit !== null ? 'Update Review' : 'Submit Review';

    document.getElementById('reviewForm').addEventListener('submit', function(event) {
        event.preventDefault();
        handleReviewFormSubmit(productId);
    });

    reviewIndexToEdit = null;
}

// Function to calculate average rating
function calculateAverageRating(productReviews) {
    if (productReviews.length === 0) return 0;
    let sum = productReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / productReviews.length).toFixed(1);
}

// Function to get star representation of rating
function getStars(rating) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
        stars += i < rating ? '★' : '☆';
    }
    return stars;
}

// Function to save a new review
function saveReview(productId) {
    let rating = document.getElementById('reviewRating').value;
    let reviewText = document.getElementById('reviewText').value;

    if (!rating || reviewText.trim() === '') {
        alert('Please provide a valid rating and review text.');
        return;
    }

    let products = JSON.parse(localStorage.getItem('products')) || [];
    let product = products.find(p => p.id === productId);
    if (!product) return;

    product.reviews.push({ rating: parseInt(rating), text: reviewText });
    localStorage.setItem('products', JSON.stringify(products));
    displayProductDetails();

    document.getElementById('reviewForm').reset();
}

// Function to edit review
function editReview(productId, reviewIndex) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    let product = products.find(p => p.id === productId);
    if (!product) return;

    let review = product.reviews[reviewIndex];
    document.getElementById('reviewRating').value = review.rating;
    document.getElementById('reviewText').value = review.text;

    document.getElementById('reviewForm').removeEventListener('submit', saveReview);
    document.getElementById('reviewForm').addEventListener('submit', function(event) {
        event.preventDefault();
        updateReview(productId, reviewIndex);
    });
}

// Function to update review
function updateReview(productId, reviewIndex) {
    let rating = document.getElementById('reviewRating').value;
    let reviewText = document.getElementById('reviewText').value;

    let products = JSON.parse(localStorage.getItem('products')) || [];
    let product = products.find(p => p.id === productId);
    if (!product) return;

    let review = product.reviews[reviewIndex];
    review.rating = parseInt(rating);
    review.text = reviewText;
    localStorage.setItem('products', JSON.stringify(products));
    displayProductDetails();

    document.getElementById('reviewForm').reset();
    document.getElementById('reviewForm').removeEventListener('submit', updateReview);
    document.getElementById('reviewForm').addEventListener('submit', function(event) {
        event.preventDefault();
        saveReview(productId);
    });
}

// Function to delete review
function deleteReview(productId, reviewIndex) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    let product = products.find(p => p.id === productId);
    if (!product) return;

    product.reviews.splice(reviewIndex, 1);
    localStorage.setItem('products', JSON.stringify(products));
    displayProductDetails();
}

// Function to handle review form submission
function handleReviewFormSubmit(productId) {
    if (reviewIndexToEdit !== null) {
        updateReview(productId, reviewIndexToEdit);
    } else {
        saveReview(productId);
    }
}

let reviewIndexToEdit = null;
