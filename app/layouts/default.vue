<template>
  <div class="wrapper" :class="{ 'nav-open': $sidebar.showSidebar }">
    <notifications></notifications>
    <side-bar
      :background-color="sidebarBackground"
      :short-title="$t('default.shortTitle')"
      :title="$t('default.title')"
    >
      <template slot-scope="props" slot="links">
        <sidebar-item
          :link="{
            name: $t('default.dashboard'),
            icon: 'tim-icons icon-laptop',
            path: '/dashboard'
          }"
        >
        </sidebar-item>
        <sidebar-item
          :link="{
            name: $t('default.devices'),
            icon: 'tim-icons icon-light-3',
            path: '/devices'
          }"
        >
        </sidebar-item>
        <sidebar-item
          :link="{
            name: $t('default.alarms'),
            icon: 'tim-icons icon-bell-55',
            path: '/alarms'
          }"
        >
        </sidebar-item>
        <sidebar-item
          :link="{
            name: $t('default.templates'),
            icon: 'tim-icons icon-components',
            path: '/templates'
          }"
        >
        </sidebar-item>
        <!-- <sidebar-item
          :link="{
            name: $t('default.icons'),
            icon: 'tim-icons icon-atom',
            path: '/icons'
          }"
        >
        </sidebar-item> -->
        <!-- <sidebar-item
          :link="{
            name: $t('default.maps'),
            icon: 'tim-icons icon-pin',
            path: '/google'
          }"
        >
        </sidebar-item>

        <sidebar-item
          :link="{
            name: $t('default.notifications'),
            icon: 'tim-icons icon-bell-55',
            path: '/notifications'
          }"
        >
        </sidebar-item>

        <sidebar-item
          :link="{
            name: $t('default.userProfile'),
            icon: 'tim-icons icon-single-02',
            path: '/user'
          }"
        >
        </sidebar-item>

        <sidebar-item
          :link="{
            name: $t('default.regularTables'),
            icon: 'tim-icons icon-puzzle-10',
            path: '/regular'
          }"
        ></sidebar-item>

        <sidebar-item
          :link="{
            name: $t('default.typography'),
            icon: 'tim-icons icon-align-center',
            path: '/typography'
          }"
        ></sidebar-item>

        <sidebar-item
          :link="{
            name: $t('default.rtl'),
            icon: 'tim-icons icon-world',
            path: localePath('/rtl', 'ar')
          }"
        ></sidebar-item>
        <sidebar-item
          :link="{
            name: 'Fun',
            icon: 'tim-icons icon-world',
            path: '/fun'
          }"
        ></sidebar-item> -->

        <!--<li class="active-pro">
          <a href="https://www.creative-tim.com/product/nuxt-black-dashboard-pro" target="_blank">
            <i class="tim-icons icon-spaceship"></i>
            <p>Upgrade to PRO</p>
          </a>
        </li>-->
      </template>
    </side-bar>
    <!--Share plugin (for demo purposes). You can remove it if don't plan on using it-->
    <!-- <sidebar-share :background-color.sync="sidebarBackground"> </sidebar-share> -->
    <div class="main-panel" :data="sidebarBackground">
      <dashboard-navbar></dashboard-navbar>
      <router-view name="header"></router-view>

      <div :class="{ content: !isFullScreenRoute }" @click="toggleSidebar">
        <zoom-center-transition :duration="200" mode="out-in">
          <!-- your content here -->
          <nuxt></nuxt>
        </zoom-center-transition>
      </div>
      <content-footer v-if="!isFullScreenRoute"></content-footer>
    </div>
  </div>
</template>
<script>
/* eslint-disable no-new */
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";
import SidebarShare from "@/components/Layout/SidebarSharePlugin";
function hasElement(className) {
  return document.getElementsByClassName(className).length > 0;
}

function initScrollbar(className) {
  if (hasElement(className)) {
    new PerfectScrollbar(`.${className}`);
  } else {
    // try to init it later in case this component is loaded async
    setTimeout(() => {
      initScrollbar(className);
    }, 100);
  }
}

import DashboardNavbar from "@/components/Layout/DashboardNavbar.vue";
import ContentFooter from "@/components/Layout/ContentFooter.vue";
import DashboardContent from "@/components/Layout/Content.vue";
import { SlideYDownTransition, ZoomCenterTransition } from "vue2-transitions";
import mqtt from 'mqtt';

export default {
  components: {
    DashboardNavbar,
    ContentFooter,
    DashboardContent,
    SlideYDownTransition,
    ZoomCenterTransition,
    SidebarShare
  },
  data() {
    return {
        sidebarBackground: "vue", //vue|blue|orange|green|red|primary
        mqttClient: null,
        options: {
            host: process.env.mqtt_host,
            port: process.env.mqtt_ws_port,
            endpoint: '/mqtt',
            clean: true,
            connectTimeout: 5000,
            reconnectPeriod: 5000,
            
            clientId: 'web_' + this.$store.state.auth.userData.name + '_' + Math.floor(Math.random() * 1000000 + 1),
            username: '',
            password: ''
        }
    };
  },
  computed: {
    isFullScreenRoute() {
      return this.$route.path === "/maps/full-screen";
    }
  },
  methods: {
    toggleSidebar() {
      if (this.$sidebar.showSidebar) {
        this.$sidebar.displaySidebar(false);
      }
    },
    initScrollbar() {
      let docClasses = document.body.classList;
      let isWindows = navigator.platform.startsWith("Win");
      if (isWindows) {
        // if we are on windows OS we activate the perfectScrollbar function
        initScrollbar("sidebar");
        initScrollbar("main-panel");
        initScrollbar("sidebar-wrapper");

        docClasses.add("perfect-scrollbar-on");
      } else {
        docClasses.add("perfect-scrollbar-off");
      }
    },
    getConditionText(value) {
        switch (value) {
            case 'gt' : 
                return '>' ;
            case 'eq' : 
                return '=' ;
            case 'get': 
                return '>=';
            case 'lt' : 
                return '<' ;
            case 'let': 
                return '<=';
            case 'neq': 
                return '!=';
            default:
                return null;
        }
    },
    async getMqttCredentials() {
        var axiosConfig = {
            headers: {
                token: this.$store.state.auth.token
            }
        };

        try {
            var credentials = await this.$axios.post('/users/auth', null, axiosConfig);
            if (credentials.data.status == 'success') {
                this.options.username = credentials.data.username;
                this.options.password = credentials.data.password;    
            }
        } catch (error) {
            console.log(error);
            if (error.response.status == 401) {
                console.log('NO VALID TOKEN');
                localStorage.clear();
                var auth = {};
                this.$store.commit('setAuth', auth);
                window.location.href = "/login";
            }
        }
    },
    async getMqttCredentialsForReconnect() {
        var axiosConfig = {
            headers: {
                token: this.$store.state.auth.token
            }
        };

        try {
            var credentials = await this.$axios.post('/users/auth-reconnect', null, axiosConfig);
            if (credentials.data.status == 'success') {
                this.options.username = credentials.data.username;
                this.options.password = credentials.data.password;    
            }
        } catch (error) {
            console.log(error);
            if (error.response.status == 401) {
                console.log('NO VALID TOKEN');
                localStorage.clear();
                var auth = {};
                this.$store.commit('setAuth', auth);
                window.location.href = "/login";
            }
        }
    },
    async startMqttClient() {
        try {
            await this.getMqttCredentials();

            var deviceTopic = 
                this.$store.state.auth.userData._id + '/+/+/sdata';
            var notificationTopic = 
                this.$store.state.auth.userData._id + '/+/+/notif';

            var mqttUrl = process.env.mqtt_ssl_prefix + this.options.host + ':' + this.options.port + this.options.endpoint;

        
            this.mqttClient = mqtt.connect(mqttUrl, this.options);    
        } catch (error) {
            console.log(error);
        }

        if (this.mqttClient) {
            this.mqttClient.on('connect', () => {
                console.log('MQTT CONNECTION -> SUCCESS;');
                console.log('\n');

                this.mqttClient.subscribe(deviceTopic, { qos:0 }, (err) => {
                    if (err) {
                        console.log('ERROR MQTT Subscribe device', err);
                        return;
                    }
                    console.log('MQTT Subscribed device');
                    console.log(deviceTopic);
                })

                this.mqttClient.subscribe(notificationTopic, { qos:0 }, (err) => {
                    if (err) {
                        console.log('ERROR MQTT Subscribe notifications', err);
                        return;
                    }
                    console.log('MQTT Subscribed notifications');
                    console.log(notificationTopic);
                })
            });

            this.mqttClient.on('reconnect', async (error) => {
                console.log('RECONNECTING MQTT ->', error);
                await this.getMqttCredentialsForReconnect();
                this.mqttClient.options.username = this.options.username;
                this.mqttClient.options.password = this.options.password;
            });

            this.mqttClient.on('error', (error) => {
                console.log('MQTT CONNECTION FAIL -> ', error);
            });

            this.mqttClient.on("disconnect", error => {
                console.log("MQTT DISCONNECT ->", error);
            });

            this.mqttClient.on('message', (topic, message) => {
                console.log('MQTT Message -> ' + topic + ' -> ');
                console.log(message.toString());

                var msgJson = JSON.parse(message);
                try {
                    var topicArray = topic.split('/');
                    switch (topicArray[3]) {
                        case 'notif':
                            this.$notify({
                                type: 'info',
                                icon: "tim-icons icon-alert-circle-exc",
                                message: this.$i18n.t('default.msgNotification') + msgJson.variableName + ' ' + this.getConditionText(msgJson.condition) + ' ' + msgJson.value
                            });
                            this.$store.dispatch('getNotifications');
                            return;
                        case 'sdata':
                            this.$nuxt.$emit(topic, JSON.parse(message.toString()));
                            return;
                        default:
                            return;
                    }
                } catch (error) {
                    console.log(error);
                }
            });

            this.$nuxt.$on('mqtt-sender', (data) => {
                this.mqttClient.publish(data.topic, JSON.stringify(data.msg));
            });
        }
    }
  },
  mounted() {
    this.$store.dispatch("getNotifications");
    this.initScrollbar();
    this.startMqttClient();
  },
  beforeDestroy() {
    this.$nuxt.$off('mqtt-sender');
  }
};
</script>
<style lang="scss">
$scaleSize: 0.95;
@keyframes zoomIn95 {
  from {
    opacity: 0;
    transform: scale3d($scaleSize, $scaleSize, $scaleSize);
  }
  to {
    opacity: 1;
  }
}

.main-panel .zoomIn {
  animation-name: zoomIn95;
}

@keyframes zoomOut95 {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    transform: scale3d($scaleSize, $scaleSize, $scaleSize);
  }
}

.main-panel .zoomOut {
  animation-name: zoomOut95;
}
</style>
