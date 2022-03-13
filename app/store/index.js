export const state = () => ({
    auth: null,
    devices: [],
    selectedDevice: {},
    notifications: []
});

export const mutations = {
    setAuth(state, auth) {
        state.auth = auth;
    },

    setDevices(state, devices) {
        state.devices = devices;
    },

    setSelectedDevice(state, device) {
        state.selectedDevice = device;
    },

    setNotifications(state, notifications) {
        state.notifications = notifications;
    }
}

const Cookies = require('js-cookie');
export const actions = {
    readToken() {
        var auth = null;
        try {
            if (!this.state.auth) {
                if (process.client) {
                    //auth = JSON.parse(Cookies.get('auth'));
                    auth = JSON.parse(localStorage.getItem('auth'));
                    this.commit('setAuth', auth);
                }
            }
        } catch (error) {
            console.log(error);
        }
    },

    getDevices() {
        const axiosHeader = {
            headers: {
                token: this.state.auth.token
            }
        };

        this.$axios.get('/devices', axiosHeader)
        .then(res => {
            if (res.data.status == 'success') {
                res.data.data.forEach(device => {
                    if (device.selected) {
                        this.commit('setSelectedDevice', device);
                        $nuxt.$emit('selectedDevice', device);
                    }
                });

                // No devices
                if (res.data.data.length == 0) {
                    this.commit('setSelectedDevice', {});
                    $nuxt.$emit('selectedDevice', {});
                }

                this.commit('setDevices', res.data.data);
            }
        })
        .catch(error => {
            console.log(error);
        });
    },

    getNotifications() {
        const axiosHeader = {
            headers: {
                token: this.state.auth.token
            }
        };

        this.$axios.get('/notifications', axiosHeader)
        .then(res => {
            if (res.data.status == 'success') {
                this.commit('setNotifications', res.data.data);
            }
        })
        .catch(error => {
            console.log(error);
        });
    }


}