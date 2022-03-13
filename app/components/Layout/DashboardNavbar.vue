<template>
  <base-nav
    v-model="showMenu"
    class="navbar-absolute top-navbar"
    type="white"
    :transparent="true"
  >
    <div slot="brand" class="navbar-wrapper">
      <div
        class="navbar-toggle d-inline"
        :class="{ toggled: $sidebar.showSidebar }"
      >
        <button type="button" class="navbar-toggler" @click="toggleSidebar">
          <span class="navbar-toggler-bar bar1"></span>
          <span class="navbar-toggler-bar bar2"></span>
          <span class="navbar-toggler-bar bar3"></span>
        </button>
      </div>
      <a class="navbar-brand ml-xl-3 ml-5" href="#">{{ routeName }}</a>
    </div>

    <ul class="navbar-nav" :class="$rtl.isRTL ? 'mr-auto' : 'ml-auto'">
      <!--<div class="search-bar input-group" @click="searchModalVisible = true">
        <button
          class="btn btn-link"
          id="search-button"
          data-toggle="modal"
          data-target="#searchModal"
        >
          <i class="tim-icons icon-zoom-split"></i>
        </button>-->
        <!-- You can choose types of search input -->
      <!--</div>-->
      <!--<modal
        :show.sync="searchModalVisible"
        class="modal-search"
        id="searchModal"
        :centered="false"
        :show-close="true"
      >
        <input
          slot="header"
          v-model="searchQuery"
          type="text"
          class="form-control"
          id="inlineFormInputGroup"
          placeholder="SEARCH"
        />
      </modal>-->
        <b-form-select v-model="selectedDevice" :options="$store.state.devices" value-field="deviceId" text-field="name" class="text-light" variant="outline-dark" @change="selectDevice()">
            <template #first>
                <b-form-select-option :value="null" disabled>{{$t('dashboardNavbar.inSelectDevice')}}</b-form-select-option>
            </template>
        </b-form-select>
      <base-dropdown
        tag="li"
        :menu-on-right="!$rtl.isRTL"
        title-tag="a"
        title-classes="nav-link"
        class="nav-item"
      >
        <template
          slot="title"
        >
          <div class="notification d-none d-lg-block d-xl-block" v-if="$store.state.notifications.length > 0"></div>
          <i class="tim-icons icon-sound-wave"></i>
          <p class="d-lg-none">{{$t('dashboardNavbar.lblNotifications')}}</p>
        </template>
        <li class="nav-link" v-for="notification in $store.state.notifications" :key="index" @click="readNotification(notification._id)">
            <a href="#" class="nav-item dropdown-item">
                {{ getDateString(notification.createTime) }} - <b>{{ notification.deviceName }}</b> {{ notification.variableName }} {{ notification.condition }} {{ notification.value }} : {{ notification.payload.value }}
            </a>
        </li>
        <!-- <li class="nav-link">
          <a href="#" class="nav-item dropdown-item">You have 5 more tasks</a>
        </li>
        <li class="nav-link">
          <a href="#" class="nav-item dropdown-item"
            >Your friend Michael is in town</a
          >
        </li>
        <li class="nav-link">
          <a href="#" class="nav-item dropdown-item">Another notification</a>
        </li>
        <li class="nav-link">
          <a href="#" class="nav-item dropdown-item">Another one</a>
        </li> -->
      </base-dropdown>
      <base-dropdown
        tag="li"
        :menu-on-right="!$rtl.isRTL"
        title-tag="a"
        class="nav-item"
        title-classes="nav-link"
        menu-classes="dropdown-navbar"
      >
        <template
          slot="title"
        >
          <div class="photo"><img src="img/default-avatar.png" /></div>
          <b class="caret d-none d-lg-block d-xl-block"></b>
          <p @click="logOut()" class="d-lg-none">{{$t('dashboardNavbar.lblLogOut')}}</p>
        </template>
        <li class="nav-link" 
            v-for="locale in availableLocales" 
            :key="locale.code">
          <a href="#" 
            class="nav-item dropdown-item"
            @click.prevent.stop="$i18n.setLocale(locale.code)">
            {{locale.name}}</a>
        </li>
        <li class="nav-link">
          <div class="togglebutton switch-change-color mt-3">
            <span v-if="darkMode" class="label-switch">{{$t('dashboardNavbar.lblLight')}}</span>
            <base-switch v-model="darkMode" @input="toggleMode"></base-switch>
            <span v-if="!darkMode" class="label-switch label-right">{{$t('dashboardNavbar.lblDark')}}</span>
          </div>
        </li>
        <!-- <li class="nav-link">
          <a href="#" class="nav-item dropdown-item">Profile</a>
        </li>
        <li class="nav-link">
          <a href="#" class="nav-item dropdown-item">Settings</a>
        </li> -->
        <div class="dropdown-divider"></div>
        <li class="nav-link">
          <a href="#" @click="logOut()" class="nav-item dropdown-item">{{$t('dashboardNavbar.lblLogOut')}}</a>
        </li>
      </base-dropdown>
    </ul>
  </base-nav>
</template>
<script>
import { CollapseTransition } from 'vue2-transitions';
import { BaseNav, Modal } from '~/components/base';
import { dashboardNavbar } from '~/lang/en';

export default {
  components: {
    CollapseTransition,
    BaseNav,
    Modal
  },
  computed: {
    routeName() {
      //const { path } = this.$route;
      //let parts = path.split('/')
      //if(parts == ','){
      //  return 'Dashboard';
      //}
      //return parts.map(p => this.capitalizeFirstLetter(p)).join(' ');
      return this.$i18n.t(this.$route.name+'.title')
    },
    isRTL() {
      return this.$rtl.isRTL;
    },
    availableLocales () {
      return this.$i18n.locales.filter(i => i.code !== this.$i18n.locale)
    }
  },
  data() {
    return {
      darkMode: true,
      activeNotifications: false,
      showMenu: false,
      searchModalVisible: false,
      searchQuery: '',
      selectedDevice: null,
    };
  },
  mounted() {
      this.$store.dispatch('getDevices');
      this.$store.dispatch('getNotifications');
      this.$nuxt.$on("selectedDevice", this.setSelectDevice)
  },
  beforeDestroy() {
      this.$nuxt.$off("selectedDevice")
  },
  methods: {
    toggleMode(type) {
      let docClasses = document.body.classList;
      if (type) {
        docClasses.remove('white-content');
      } else {
        docClasses.add('white-content');
      }
    },
    getDateString(ms) {
        var d = new Date(ms);
        return d.toLocaleString();
    },
    capitalizeFirstLetter(string) {
      if (!string || typeof string !== 'string') {
        return ''
      }
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    closeDropDown() {
      this.activeNotifications = false;
    },
    toggleSidebar() {
      this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
    },
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
    setSelectDevice(device) {
        this.selectedDevice = device.deviceId;
    },
    selectDevice() {
        var axiosConfig = {
            headers: {
                token: this.$store.state.auth.token
            }
        };

        var data = {
            deviceId: deviceId
        };

        this.$axios
        .put('/devices', data, axiosConfig)
        .then(res => {
            //success
            if (res.data.status == 'success') {
                this.$notify({
                    type: 'success',
                    icon: 'tim-icons icon-check-2',
                    message: this.$i18n.t('dashboardNavbar.msgSelectDevice')
                });
                this.$store.dispatch('getDevices');
            }
        })
        .catch(e => {
            console.log(e.response.data);
            this.$notify({
                type: "danger",
                icon: "tim-icons icon-alert-circle-exc",
                message: this.$i18n.t('dashboardNavbar.msgSelectDeviceError')
            });
        });
    },
    readNotification(id) {
        var axiosConfig = {
            headers: {
                token: this.$store.state.auth.token
            }
        };

        var data = {
            id: id
        };

        this.$axios
        .put('/notifications', data, axiosConfig)
        .then(res => {
            //success
            if (res.data.status == 'success') {
                this.$store.dispatch('getNotifications');
            }
        })
        .catch(e => {
            console.log(e.response.data);
            this.$notify({
                type: "danger",
                icon: "tim-icons icon-alert-circle-exc",
                message: this.$i18n.t('dashboardNavbar.msgNotificationsError')
            });
        });
    },
    logOut() {
        localStorage.removeItem('auth');
        var auth = {};
        this.$store.commit('setAuth', auth);
        window.location.href = "/login";
    }
  }
};
</script>
<style scoped>
.top-navbar {
  top: 0px;
}
</style>
