$(document).ready(function () {
    var decreaseButtons = $('.decrease-quantity');
    var increaseButtons = $('.increase-quantity');
    var totalPrices = $('[data-price-element]');
    var quantityInputs = $('.quantity');

    decreaseButtons.click(function () {
        var quantityInput = $(this).closest('.modal').find('.quantity');
        var currentQuantity = parseInt(quantityInput.val());
        if (currentQuantity > 1) {
            quantityInput.val(--currentQuantity);
            updateTotalPrice();
        }
    });

    increaseButtons.click(function () {
        var quantityInput = $(this).closest('.modal').find('.quantity');
        var currentQuantity = parseInt(quantityInput.val());
        quantityInput.val(++currentQuantity);
        updateTotalPrice();
    });

    function updateTotalPrice() {
        quantityInputs.each(function (index) {
            var modal = $(this).closest('.modal');
            var basePriceElement = modal.find('.total-price[data-price-element]');
            var basePrice = parseFloat(basePriceElement.attr('data-price'));
            var quantity = parseInt($(this).val());
            var additionalProducts = modal.find('.additional-product-checkbox:checked');
            var additionalPrice = 0;

            additionalProducts.each(function () {
                additionalPrice += parseFloat($(this).attr('data-price'));
            });

            var newTotal = (basePrice + additionalPrice) * quantity;
            totalPrices.eq(index).text(newTotal.toFixed(2));
        });
    }

    var additionalProductCheckboxes = $('.additional-product-checkbox');
    additionalProductCheckboxes.change(updateTotalPrice);

    $('.edit-button').click(function () {
        var productId = $(this).data('id');
        var product = GetProductInfo(productId);
        $('#productId').val(productId);
        $('#selectedIngredients').val(product.Ingredients);
        $('#selectedAdditionalProducts').val(product.AdditionalProducts);
        $('#quantity').val(product.Quantity);
        $('#productModal').modal('show');
    });

    setTimeout(function () {
        updateTotalPrice();
    }, 100);

    $('#saveButton').click(function () {
        var formData = $('#productModal form').serialize();
        $.ajax({
            url: '/Home/Edit',
            type: 'POST',
            data: formData,
            success: function (response) {
                var editedProduct = response.edited;
                var cartItemRow = $('#cartItem-' + editedProduct.Id);
                cartItemRow.find('td[data-bs-toggle]').text('$' + editedProduct.Price);
                $('#productModal').modal('hide');
            },
            error: function (error) {
                console.error('Error editing product:', error);
            }
        });
    });
});

$('.remove-button').click(function () {
    var itemId = $(this).data('id');
    $.ajax({
        url: '/Home/RemoveToCart',
        type: 'POST',
        data: { id: itemId },
        success: function (result) {
            if (result.removed) {
                $('#cartItem-' + itemId).next('tr').remove();
                $('#cartItem-' + itemId).remove();
                $('#payment-' + itemId).next('tr').remove();
                $('#payment-' + itemId).remove();

                // Obter o novo preço total
                $.ajax({
                    url: '/Home/GetTotalPrice',
                    type: 'POST',   
                    success: function (response) {
                        // Atualizar o preço total
                        $('.totalCartPrice').text(response.totalPrice);
                    }
                });
            }
        }
    });
});


// Select Pay Method
$(document).ready(function () {
    $('.radio-group .radio').click(function () {
        $('.selected .fa').removeClass('fa-check');
        $('.radio').removeClass('selected');
        $(this).addClass('selected');
    });
});

$(document).ready(function () {
    $('.payment-option').click(function () {
        var paymentMethod = $(this).data('payment-method');
    
        $('.payment-column').hide(); // Oculta todas as colunas de pagamento

        if (paymentMethod === 'pix') {
            $('#pixColumn').show();
        } else if (paymentMethod === 'card') {
            $('#cardColumn').show();
        } else if (paymentMethod === 'money') {
            $('#moneyColumn').show();
        }
    });
});