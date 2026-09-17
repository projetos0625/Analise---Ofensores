document.addEventListener("DOMContentLoaded", () => {

    const SESSION_KEY = "sigdHSession";
    const REMEMBER_KEY = "sigdHRememberUser";

    const users = [
        {
            username: "Jamily",
            password: "123456",
            name: "Jamily Dias",
            role: "Administradora",
            initials: "JD"
        },
        {
            username: "Bruna",
            password: "123456",
            name: "Bruna Dias",
            role: "Usuária",
            initials: "BD"
        }
    ];

    const loginForm = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
    const rememberUser = document.getElementById("rememberUser");
    const loginMessage = document.getElementById("loginMessage");
    const loginButton = document.getElementById("loginButton");
    const loginButtonText = document.getElementById("loginButtonText");
    const loginButtonIcon = document.getElementById("loginButtonIcon");
    const forgotPassword = document.getElementById("forgotPassword");
    const forgotModal = document.getElementById("forgotModal");
    const closeForgotModal = document.getElementById("closeForgotModal");
    const closeForgotButton = document.getElementById("closeForgotButton");
    const modalOverlay = forgotModal
        ? forgotModal.querySelector(".modal-overlay")
        : null;

    const demoUsers = document.querySelectorAll(".demo-user");

    function showMessage(message, type = "info") {

        if (!loginMessage) {
            return;
        }

        loginMessage.textContent = message;
        loginMessage.className = "login-message show " + type;

    }


    function clearMessage() {

        if (!loginMessage) {
            return;
        }

        loginMessage.textContent = "";
        loginMessage.className = "login-message";

    }


    
    function setLoadingState(loading) {

        if (!loginButton) {
            return;
        }

        loginButton.disabled = loading;

        if (loading) {

            if (loginButtonText) {
                loginButtonText.textContent = "Entrando...";
            }

            if (loginButtonIcon) {
                loginButtonIcon.className =
                    "fa-solid fa-spinner fa-spin";
            }

        } else {

            if (loginButtonText) {
                loginButtonText.textContent = "Entrar no sistema";
            }

            if (loginButtonIcon) {
                loginButtonIcon.className =
                    "fa-solid fa-arrow-right";
            }

        }

    }

    function normalize(value) {

        return String(value || "")
            .trim()
            .toLowerCase();

    }

    function findUser(username, password) {

        const normalizedUsername = normalize(username);

        return users.find(user => {

            return (
                normalize(user.username) === normalizedUsername &&
                user.password === password
            );

        });

    }

    function createSession(user) {

        const session = {

            username: user.username,

            name: user.name,

            role: user.role,

            initials: user.initials,

            loginTime: new Date().toISOString()

        };

        sessionStorage.setItem(
            SESSION_KEY,
            JSON.stringify(session)
        );

    }

    function handleRememberUser() {

        if (!usernameInput || !rememberUser) {
            return;
        }

        const username = usernameInput.value.trim();

        if (rememberUser.checked && username) {

            localStorage.setItem(
                REMEMBER_KEY,
                username
            );

        } else {

            localStorage.removeItem(REMEMBER_KEY);

        }

    }

    function loadRememberedUser() {

        const savedUser =
            localStorage.getItem(REMEMBER_KEY);

        if (!savedUser || !usernameInput) {
            return;
        }

        usernameInput.value = savedUser;

        if (rememberUser) {
            rememberUser.checked = true;
        }

    }


    if (togglePassword && passwordInput) {

        togglePassword.addEventListener("click", () => {

            const isPassword =
                passwordInput.type === "password";

            passwordInput.type =
                isPassword ? "text" : "password";

            const icon =
                togglePassword.querySelector("i");

            if (icon) {

                icon.className = isPassword
                    ? "fa-regular fa-eye-slash"
                    : "fa-regular fa-eye";

            }

            togglePassword.setAttribute(
                "aria-label",
                isPassword
                    ? "Ocultar senha"
                    : "Mostrar senha"
            );

            passwordInput.focus();

        });

    }

    if (loginForm) {

        loginForm.addEventListener("submit", async (event) => {

            event.preventDefault();

            clearMessage();

            const username =
                usernameInput
                    ? usernameInput.value.trim()
                    : "";

            const password =
                passwordInput
                    ? passwordInput.value
                    : "";


            if (!username) {

                showMessage(
                    "Digite seu usuário para continuar.",
                    "error"
                );

                usernameInput?.focus();

                return;
            }


            if (!password) {

                showMessage(
                    "Digite sua senha para continuar.",
                    "error"
                );

                passwordInput?.focus();

                return;
            }

            setLoadingState(true);


            await new Promise(resolve => {
                setTimeout(resolve, 500);
            });

            const user =
                findUser(username, password);


            if (!user) {

                setLoadingState(false);

                showMessage(
                    "Usuário ou senha incorretos. Verifique seus dados e tente novamente.",
                    "error"
                );

                passwordInput?.focus();

                return;
            }

            handleRememberUser();
            createSession(user);
            showMessage(
                `Olá, ${user.name.split(" ")[0]}! Preparando seu acesso...`,
                "success"
            );

            if (loginButtonText) {
                loginButtonText.textContent = "Acesso autorizado";
            }

            if (loginButtonIcon) {
                loginButtonIcon.className =
                    "fa-solid fa-check";
            }

            setTimeout(() => {

                window.location.href =
                    "dashboard.html";

            }, 650);

        });

    }

    demoUsers.forEach(button => {

        button.addEventListener("click", () => {

            const user =
                button.dataset.user || "";

            const password =
                button.dataset.password || "";


            if (usernameInput) {
                usernameInput.value = user;
            }

            if (passwordInput) {
                passwordInput.value = password;
            }

            if (rememberUser) {
                rememberUser.checked = false;
            }

            clearMessage();


            button.classList.add("selected");


            setTimeout(() => {
                button.classList.remove("selected");
            }, 300);

            if (loginForm) {

                loginForm.requestSubmit();

            }

        });

    });

    [usernameInput, passwordInput].forEach(input => {

        if (!input) {
            return;
        }

        input.addEventListener("input", () => {

            if (
                loginMessage &&
                loginMessage.classList.contains("show")
            ) {

                clearMessage();

            }

        });

    });

    function openForgotModal() {

        if (!forgotModal) {
            return;
        }

        forgotModal.classList.add("active");

        forgotModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow = "hidden";


        setTimeout(() => {

            closeForgotModal?.focus();

        }, 50);

    }


    function closeForgotModalWindow() {

        if (!forgotModal) {
            return;
        }

        forgotModal.classList.remove("active");

        forgotModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.style.overflow = "";

    }


    if (forgotPassword) {

        forgotPassword.addEventListener(
            "click",
            openForgotModal
        );

    }


    if (closeForgotModal) {

        closeForgotModal.addEventListener(
            "click",
            closeForgotModalWindow
        );

    }

    if (closeForgotButton) {

        closeForgotButton.addEventListener(
            "click",
            closeForgotModalWindow
        );

    }


    if (modalOverlay) {

        modalOverlay.addEventListener(
            "click",
            closeForgotModalWindow
        );

    }

    document.addEventListener("keydown", event => {

        if (
            event.key === "Escape" &&
            forgotModal?.classList.contains("active")
        ) {

            closeForgotModalWindow();

        }

    });

    if (rememberUser) {

        rememberUser.addEventListener("change", () => {

            if (!rememberUser.checked) {

                localStorage.removeItem(
                    REMEMBER_KEY
                );

            }

        });

    }

    if (usernameInput && !usernameInput.value) {

        setTimeout(() => {

            usernameInput.focus();

        }, 300);

    }

    loadRememberedUser();

    if (usernameInput) {

        usernameInput.addEventListener(
            "input",
            () => {

                usernameInput.value =
                    usernameInput.value.replace(
                        /\s/g,
                        ""
                    );

            }
        );

    }

    console.log(
        "SIGDH iniciado com sucesso."
    );

});
