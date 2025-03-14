// Remove version based on UTM
(function (isV2) {
	if (isV2) return document.getElementById('version-1').remove();
	return document.getElementById('version-2').remove();
})(window.is_v2)

// Opens up modal on hash		
if (window.location.hash) {
	var modalId = window.location.hash.substring(1);
	var modalElement = document.getElementById(modalId);
	if (modalElement && modalElement.classList.contains("modal")) {
		var modal = new bootstrap.Modal(modalElement);
		modal.show();
	}
}

(async function ($) {

	$('.reviews').owlCarousel({
		loop: true,
		margin: 10,
		nav: false,
		responsive: {
			0: {
				items: 1
			},
			600: {
				items: 2
			},
			1000: {
				items: 3
			}
		}
	});

	$('.advisory-board').owlCarousel({
		loop: true,
		margin: 10,
		nav: false,
		responsive: {
			0: {
				items: 1
			},
			600: {
				items: 2
			},
			1000: {
				items: 3
			}
		}
	});

	$('.rem-percentage').owlCarousel({
		loop: true,
		margin: 10,
		nav: false,
		responsive: {
			0: {
				items: 1
			},
			600: {
				items: 2
			},
			1000: {
				items: 3
			}
		}
	});

	$('#version-1 .wear-tech').owlCarousel({
		loop: true,
		margin: 10,
		nav: false,
		responsive: {
			0: {
				items: 1
			},
			600: {
				items: 2
			},
			1000: {
				items: 3
			}
		}
	});

	// sleep deeply video
	document.getElementById('sleepDeeplyVideo').addEventListener('click', function () {
		var container = document.querySelector('.sleep-deeply-video');
		var videoHtml = `
			<div class="col-md-8 offset-md-2 mb-4">
				<div class="ratio ratio-16x9">
					<iframe src="https://www.youtube.com/embed/4hE5jBEqA1c?autoplay=1&rel=0" title="How It Works" allow="autoplay; encrypted-media" allowfullscreen></iframe>
				</div>
			</div>
		`;

		container.innerHTML = videoHtml;

		var videoSection = document.querySelector('.sleep-deeply-video-section');
		videoSection.style.padding = '0';
	});

	// jay glazer video
	document.getElementById('jayGlazerVideo').addEventListener('click', function () {
		var container = document.querySelector('.jay-glazer-video');

		var videoHtml = `
			<div class="video-container">
				<iframe src="https://www.youtube.com/embed/3BucBrM8xRM?autoplay=1&rel=0" title="The REM Super Patch - One Man's Journey" allow="autoplay; encrypted-media" allowfullscreen></iframe>
			</div>
		`;

		container.innerHTML = videoHtml;

		var videoContainer = document.querySelector('.jay-glazer-video');
		videoContainer.style.setProperty('bottom', '0', 'important');
	});

	// save utm parameters to local storage
	const params = new URLSearchParams(location.search);
	params.forEach((v, k) => sessionStorage.setItem(k, v));

	const customAttributes = ["Campaign", "Source", "Medium", "Content", "Term", "Version"].map(p => {
		return { "key": p, "value": sessionStorage.getItem("utm_" + p.toLowerCase()) }
	}).filter(p => p.value);

	var currentQuantity = 0;
	const productId = document.body.dataset.id;
	const productName = document.body.dataset.name;
	const productGID = "gid://shopify/Product/" + document.body.dataset.product;
	const variantId = "gid://shopify/ProductVariant/" + document.body.dataset.variant;
	const max_qty_available = parseInt(document.body.dataset.maxQuantity);

	const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
	const checkoutButtons = document.querySelectorAll('[data-action="checkout"]');
	const plusButtons = document.querySelectorAll('.plus-btn');
	const minusButtons = document.querySelectorAll('.minus-btn');
	const inputFields = document.querySelectorAll('.quantity');
	const quantitySelect = document.querySelector('.quantity-select');
	const totalPriceElement = document.getElementById('totalPrice');
	const pricePerItem = 60.00;

	// add to cart and cart modal
	inputFields.forEach(inp => inp.max = max_qty_available);

	addToCartButtons.forEach(button => {
		button.addEventListener('click', async function () {
			let quantity = parseInt(button.closest(".row").querySelector("input").value);
			currentQuantity = currentQuantity + quantity;

			if (quantity == 0) return;

			let new_qty_available = max_qty_available - currentQuantity;
			inputFields.forEach(inp => { inp.max = new_qty_available; inp.value = Math.min(1, new_qty_available); });
			quantitySelect.value = currentQuantity;
			updateTotalPrice(max_qty_available - new_qty_available);
			document.getElementById('cartModalOverlay').style.display = max_qty_available - new_qty_available == 0 ? '' : 'block';
			quantitySelect.closest(".row").querySelector('button').dataset.quantity = max_qty_available - new_qty_available;

			let event = new CustomEvent("add_to_cart", {
				"detail": {
					item_id: productId,
					item_sku: productId.slice(0, -2),
					item_name: productName,
					item_price: pricePerItem,
					quantity: quantity
				}
			});
			document.dispatchEvent(event);
		});
	});

	quantitySelect.addEventListener('change', async function () {
		let quantity = parseInt(this.value);

		currentQuantity = quantity;

		let new_qty_available = max_qty_available - (currentQuantity ? currentQuantity : 0);

		inputFields.forEach(inp => { inp.max = new_qty_available; inp.value = Math.min(1, new_qty_available); });
		updateTotalPrice(max_qty_available - new_qty_available);
		document.getElementById('cartModalOverlay').style.display = max_qty_available - new_qty_available == 0 ? '' : 'block';
		this.closest(".row").querySelector('button').dataset.quantity = max_qty_available - new_qty_available;

		let event = new CustomEvent("add_to_cart", {
			"detail": {
				item_id: productId,
				item_sku: productId.slice(0, -2),
				item_name: productName,
				item_price: pricePerItem,
				quantity: quantity
			}
		});
		document.dispatchEvent(event);
	});

	checkoutButtons.forEach(ckbt => {
		ckbt.addEventListener('click', async function (e) {
			e.preventDefault();

			let quantityCount = Math.max(1, currentQuantity);
			let totalValue = quantityCount * pricePerItem;

			let items = [{
				item_id: productId,
				item_sku: productId.slice(0, -2),
				item_name: productName,
				item_price: pricePerItem,
				quantity: quantityCount
			}];

			let event = new CustomEvent("init_checkout", {
				"detail": {
					quantity: quantityCount,
					value: totalValue,
					items: items
				}
			});
			document.dispatchEvent(event);

			const utmParams = ['utm_campaign', 'utm_source', 'utm_medium'];
			let utmString = utmParams.reduce((acc, param) => {
				const value = params.get(param);
				if (value) {
					acc += `&${param}=${encodeURIComponent(value)}`;
				}
				return acc;
			}, '');

			let utmContentString = '';
			const utmContent = params.get('utm_content');
			const utmVersion = params.get('utm_version');

			if (utmVersion) {
				if (utmContent) {
					utmContentString = `&utm_content=${encodeURIComponent(`${utmContent},${utmVersion}`)}`;
				} else {
					utmContentString = `&utm_content=${encodeURIComponent(utmVersion)}`;
				}
			} else if (utmContent) {
				utmContentString = `&utm_content=${encodeURIComponent(utmContent)}`;
			}

			const checkoutVariantId = variantId.replace('gid://shopify/ProductVariant/', '');
			const checkoutUrl = `https://checkout.supersleep.com/cart/${checkoutVariantId}:${quantityCount}?access_token=87f20013717bc33265c0ab86ead28dc0${utmString}${utmContentString}`;

			const checkoutLink = document.createElement('a');
			checkoutLink.href = checkoutUrl;
			await new Promise(r => setTimeout(r, 1000));

			checkoutLink.click();
		});
	});

	function updateQuantities(value) {
		inputFields.forEach(input => {
			input.value = value;
		});
	}

	function updateTotalPrice(quantity) {
		const totalPrice = pricePerItem * quantity;
		totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
	}

	inputFields.forEach(qtyfield => {
		qtyfield.addEventListener("change", function () {
			updateQuantities(Math.min(qtyfield.max, qtyfield.value));
		})
	})

	plusButtons.forEach(button => {
		button.addEventListener('click', function () {
			let newValue = parseInt(inputFields[0].value) + 1;
			updateQuantities(Math.min(newValue, inputFields[0].max));
		});
	});

	minusButtons.forEach(button => {
		button.addEventListener('click', function () {
			let currentValue = parseInt(inputFields[0].value);
			if (currentValue > 1) {
				let newValue = currentValue - 1;
				updateQuantities(Math.min(newValue, inputFields[0].max));
			}
		});
	});
})(jQuery);
