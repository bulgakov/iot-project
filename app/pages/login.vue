<template>
    <div class="container login-page">
        <div class="col-lg-4 col-md-6 ml-auto mr-auto">
            <card class="card-login card-white">
                <template slot="header">
                    <img src="img//card-success.png" alt="" />
                    <h1 class="card-title">{{$t('login.title')}}</h1>
                </template>

                <div>
                    <base-input
                        name="email"
                        v-model="user.email"
                        :placeholder="$t('login.inEmail')"
                        addon-left-icon="tim-icons icon-email-85"
                    >
                    </base-input>

                    <base-input
                        name="password"
                        v-model="user.password"
                        type="password"
                        :placeholder="$t('login.inPassword')"
                        addon-left-icon="tim-icons icon-lock-circle"
                    >
                    </base-input>
                </div>

                <div slot="footer">
                    <base-button
                        native-type="submit"
                        type="success"
                        class="mb-3"
                        size="lg"
                        @click="login"
                        block
                    >
                        {{ $t('login.btnLogin') }}
                    </base-button>
                    <div class="pull-left">
                        <h6>
                            <nuxt-link class="link footer-link" to="/register">
                                {{ $t('login.lnkRegister')}}
                            </nuxt-link>
                        </h6>
                    </div>
                    <!-- <div class="pull-right">
                        <h6>
                            <a href="#help!!!" class="link footer-link"
                                >Need Help?</a
                            >
                        </h6>
                    </div> -->
                </div>
            </card>
        </div>
    </div>
</template>

<script>
export default {
    name: "login-page",
    layout: "auth",
    middleware: "notAuthenticated",
    data() {
        return {
            user: {
                email: "",
                password: ""
            }
        };
    },
    mounted() {
        this.$store.dispatch('readToken');
        if (this.$store.state.auth) {
            $nuxt.$router.push("/dashboard");
        }
    },
    methods: {
        login() {
            this.$axios
                .post("/users/login", this.user)
                .then(res => {
                    //success! - Usuario creado.
                    if (res.data.status == "success") {
                        this.$notify({
                            type: "success",
                            icon: "tim-icons icon-check-2",
                            message:
                                this.$i18n.t('login.msgWelcome') + res.data.userData.name
                        });
                        this.user.password = "";
                        this.user.email = "";

                        var auth = {
                            token: res.data.token,
                            userData: res.data.userData
                        };

                        this.$store.commit("setAuth", auth);
                        localStorage.setItem('auth', JSON.stringify(auth));
                        $nuxt.$router.push("/dashboard");
                        return;
                    }
                })
                .catch(e => {
                    console.log(e.response.data);
                    this.$notify({
                        type: "danger",
                        icon: "tim-icons icon-alert-circle-exc",
                        message: this.$i18n.t('login.msgLoginInvalid')
                    });
                    return;
                });
        }
    }
};
</script>

<style>
.navbar-nav .nav-item p {
    line-height: inherit;
    margin-left: 5px;
}
</style>