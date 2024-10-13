const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const addressInput = document.getElementById("address");
const addressWarn = document.getElementById("address-warn");

let cart = [];
let saboresSelecionados = []; // Array para armazenar os sabores selecionados
const maxSabores = 2; // Limite de 2 sabores

// Abrir o modal do carrinho
cartBtn.addEventListener("click", function () {
    updateCartModal();
    cartModal.style.display = "flex";
});

// Fechar o modal quando clicar fora
cartModal.addEventListener("click", function (event) {
    if (event.target === cartModal) {
        cartModal.style.display = "none";
    }
});

closeModalBtn.addEventListener("click", function () {
    cartModal.style.display = "none";
});

menu.addEventListener("click", function (event) {
    let parentButton = event.target.closest(".add-to-cart-btn");

    if (parentButton) {
        const name = parentButton.getAttribute("data-name");
        const price = parseFloat(parentButton.getAttribute("data-price"));

        // Verificar se o botão pertence ao ID pizzas2Sabores
        if (parentButton.closest("#pizzas2Sabores")) {
            if (saboresSelecionados.length < maxSabores) {
                // Adicionar sabor ao array
                saboresSelecionados.push({ name, price });
                addToCart(name, price);
            } else {
                Toastify({
                    text: "Ops, Você so pode escolher dois sabores!",
                    duration: 3000,
                    close: true,
                    gravity: "top",
                    position: "center",
                    stopOnFocus: true,
                    style: {
                        background: "#f08a16",
                    },
                }).showToast();
            }
        } else {
            // Adiciona normalmente para outros itens fora de pizzas2Sabores
            addToCart(name, price);
        }
    }
});

// Função para adicionar no carrinho
function addToCart(name, price) {
    // Verifica se o item já está no carrinho
    const existingItem = cart.find((item) => item.name === name);

    if (existingItem) {
        // Se o item já existe, aumenta apenas a quantidade + 1
        existingItem.quantity += 1;
    } else {
        // Adiciona um novo item ao carrinho com quantidade 1
        cart.push({
            name: name, // Nome do item
            price: parseFloat(price), // Certifica-se de que o preço é um número
            quantity: 1, // Quantidade inicial
        });
    }

    // Atualiza o modal do carrinho ou outras lógicas relacionadas
    updateCartModal();
}

//Atualiza o carrinho
function updateCartModal() {
    cartItemsContainer.innerHTML = "";
    let total = 0;

    // Obtenha a hora atual
    const currentHour = new Date().getHours();

    // Verifique se a taxa de entrega deve ser aplicada (entre 00h e 03h)
    const isDeliveryFeeApplicable = currentHour >= 0 && currentHour < 3;

    cart.forEach((item) => {
        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add(
            "flex",
            "justify-between",
            "mb-4",
            "flex-col"
        );

        cartItemElement.innerHTML = `
    <div class="flex items-center justify-between">
    <div>
        <p class="font-medium">${item.name}</p>
        <p>Qtd: ${item.quantity}</p>
        <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
    </div>

    <button class="remove-from-cart-btn" data-name="${item.name}">
        Remover
    </button>

    </div>
`;

        total += item.price * item.quantity;

        cartItemsContainer.appendChild(cartItemElement);
    });

    // Se a taxa de entrega for aplicável (entre 00h e 3h), adicione R$ 7,00 ao total e mostre a mensagem
    if (isDeliveryFeeApplicable) {
        total += 7; // Adiciona a taxa de entrega de 7 reais

        // Adicione a mensagem da taxa de entrega
        const deliveryMessageElement = document.createElement("div");
        deliveryMessageElement.className = "mt-4 text-red-500"; // Classe para estilizar a mensagem
        deliveryMessageElement.innerHTML =
            "Taxa de entrega: R$ 7,00 após as 00h.";
        cartItemsContainer.appendChild(deliveryMessageElement);
    }

    cartTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });

    cartCounter.innerHTML = cart.length;
}

// Função para remover o item do carrinho
cartItemsContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("remove-from-cart-btn")) {
        const name = event.target.getAttribute("data-name");

        removeItemCart(name);
    }
});

function removeItemCart(name) {
    const index = cart.findIndex((item) => item.name === name);

    if (index !== -1) {
        const item = cart[index];

        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cart.splice(index, 1);
        }

        // Se o item removido for uma pizza de dois sabores, remover do array saboresSelecionados
        const saborIndex = saboresSelecionados.findIndex(
            (sabor) => sabor.name === name
        );
        if (saborIndex !== -1) {
            saboresSelecionados.splice(saborIndex, 1); // Remove o sabor do array
        }

        updateCartModal();
    }
}

addressInput.addEventListener("input", function (event) {
    let inputValue = event.target.value;

    if (inputValue !== "") {
        addressInput.classList.remove("border-red-500");
        addressWarn.classList.add("hidden");
    }
});

// Finalizar pedido
checkoutBtn.addEventListener("click", function () {
    const isOpen = checkRestaurantOpen();
    if (!isOpen) {
        Toastify({
            text: "Ops, o restaurante está fechado!",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "#ef4444",
            },
        }).showToast();

        return;
    }

    if (cart.length === 0) return;
    if (addressInput.value === "") {
        addressWarn.classList.remove("hidden");
        addressInput.classList.add("border-red-500");
        return;
    }

    // Calcular o total diretamente da função updateCartModal ou passar o valor total calculado
    let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Obtém a hora atual
    const currentHour = new Date().getHours();

    // Variável para armazenar a mensagem de taxa de entrega, caso seja aplicável
    let deliveryFeeMessage = "";

    // Verifica se a hora está entre 00h e 03h e aplica a taxa de entrega
    if (currentHour >= 0 && currentHour < 3) {
        total += 7; // Adiciona a taxa de entrega de 7 reais
        deliveryFeeMessage = "Taxa de entrega de R$ 7 após as 00h.\n\n"; // Mensagem da taxa
        document.getElementById("delivery-message").classList.remove("hidden"); // Mostra a mensagem na tela
    } else {
        document.getElementById("delivery-message").classList.add("hidden"); // Esconde a mensagem
    }

    // Enviar o pedido para a API WhatsApp
    const cartItems = cart
        .map((item) => {
            return ` ${item.name} Quantidade: (${item.quantity}) Preço: R$ ${item.price} \n\n`;
        })
        .join("");

    // Monta a mensagem com os itens do carrinho e adiciona a mensagem de taxa de entrega, se aplicável
    const message = encodeURIComponent(
        cartItems + deliveryFeeMessage + `Total: R$ ${total.toFixed(2)}\n\n`
    );

    const phone = "91986248887";

    window.open(
        `https://wa.me/${phone}?text=${message} Endereço: ${addressInput.value}`,
        "_blank"
    );

    cart = [];
    updateCartModal();
    // Recarrega a página após finalizar o pedido
    location.reload();
});

// Finalizar pedido - função está funcionando perfeitamente, so realizando um teste
/* checkoutBtn.addEventListener("click", function () {
    const isOpen = checkRestaurantOpen();
    if (!isOpen) {
        Toastify({
            text: "Ops o restaurante está fechado!",
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "#ef4444",
            },
        }).showToast();

        return;
    }

    if (cart.length === 0) return;
    if (addressInput.value === "") {
        addressWarn.classList.remove("hidden");
        addressInput.classList.add("border-red-500");
        return;
    }

    // Calcular o total diretamente da função updateCartModal ou passar o valor total calculado
    let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    //Enviar o pedido para api whats
    const cartItems = cart
        .map((item) => {
            return ` ${item.name} Quantidade: (${item.quantity}) Preço: R$ ${item.price} \n\n`;
        })
        .join("");

    const message = encodeURIComponent(
        cartItems + `Total: R$ ${total.toFixed(2)}\n\n`
    );
    const phone = "91986248887";

    window.open(
        `https://wa.me/${phone}?text=${message} Endereço: ${addressInput.value}`,
        "_blank"
    );

    cart = [];
    saboresSelecionados = []; // Limpa o array de sabores ao finalizar o pedido
    updateCartModal();
}); */

// Verificar a hora e manipular o card horario

function checkRestaurantOpen() {
    const data = new Date();
    const hora = data.getHours();
    const diaDaSemana = data.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

    // O restaurante está aberto todos os dias
    /* const isOpenDay = true; */

    // Verifica se é terça-feira (dia 2) - dia em que o restaurante está fechado
    const isClosedOnTuesday = diaDaSemana === 2;

    // Horário de funcionamento: das 18h às 23h59 e das 00h às 2h
    const isOpenHour = (hora >= 18 && hora < 24) || (hora >= 0 && hora < 2);

    // Verifica se o restaurante está aberto
    /* const isOpen = isOpenDay && isOpenHour; */

    // O restaurante está aberto se não for terça-feira e estiver dentro do horário
    const isOpen = !isClosedOnTuesday && isOpenHour;

    // Seleciona o span pelo id "date-span"
    const spanItem = document.getElementById("date-span");

    if (isOpen) {
        // Se o restaurante estiver aberto, adiciona a classe verde e remove a vermelha
        spanItem.classList.remove("bg-red-500");
        spanItem.classList.add("bg-green-600");
        spanItem.textContent = "Seg á Dom - 18:00 as 02:00 Delivery Aberto";
    } else {
        // Se o restaurante estiver fechado, adiciona a classe vermelha e remove a verde
        spanItem.classList.remove("bg-green-600");
        spanItem.classList.add("bg-red-500");
        spanItem.textContent = "Seg á Dom - 18:00 as 02:00 Delivery Fechado";
    }

    return isOpen; // Retorna o estado do restaurante (true ou false)
}

// Chama a função para verificar o status do restaurante e atualizar o span
checkRestaurantOpen();
