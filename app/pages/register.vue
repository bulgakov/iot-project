<template>
    <div class="container login-page">
        <div class="col-lg-4 col-md-6 ml-auto mr-auto">
            <card class="card-login card-white">
                <template slot="header">
                    <img src="img//card-success.png" alt="" />
                    <h1 class="card-title">{{ $t('register.title') }}</h1>
                </template>

                <div>
                    <base-input
                        name="name"
                        v-model="user.name"
                        :placeholder="$t('register.inName')"
                        addon-left-icon="tim-icons icon-badge"
                    >
                    </base-input>

                    <base-input
                        name="email"
                        v-model="user.email"
                        :placeholder="$t('register.inEmail')"
                        addon-left-icon="tim-icons icon-email-85"
                    >
                    </base-input>

                    <base-input
                        name="password"
                        v-model="user.password"
                        type="password"
                        :placeholder="$t('register.inPassword')"
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
                        @click="register()"
                        block
                    >
                        {{ $t('register.btnRegister') }}
                    </base-button>

                    <div class="pull-left">
                        <h6>
                            <nuxt-link class="link footer-link" to="/login">
                                {{ $t('register.lnkLogin') }}
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
    layout: "auth",
    middleware: "notAuthenticated",
    data() {
        return {
            user: {
                name: "",
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
        register() {
            this.$axios
                .post("/users/register", this.user)
                .then(res => {
                    //success! - Usuario creado.
                    if (res.data.status == "success") {
                        this.$notify({
                            type: "success",
                            icon: "tim-icons icon-check-2",
                            message: this.$i18n.t('register.msgRegistered')
                        });
                        this.user.name = "";
                        this.user.password = "";
                        this.user.email = "";
                        return;
                    }
                })
                .catch(e => {
                    console.log(e.response.data);
                    if (e.response.data.error.errors.email.kind == "unique") {
                        this.$notify({
                            type: "danger",
                            icon: "tim-icons icon-alert-circle-exc",
                            message: this.$i18n.t('msgEmailInvalid')
                        });
                        return;
                    } else {
                        this.$notify({
                            type: "danger",
                            icon: "tim-icons icon-alert-circle-exc",
                            message: this.$i18n.t('msgCreateUserError')
                        });
                        return;
                    }
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