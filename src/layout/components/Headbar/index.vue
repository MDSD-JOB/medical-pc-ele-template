<template>
  <el-scrollbar wrap-class="scrollbar-wrapper">
    <div class="headbar">
      <div class="logo-wrapper">
        <img :src="logo" alt="logo">
        <img :src="badge" alt="badge">
      </div>
      <el-menu
        mode="horizontal"
        :default-active="activeMenu"
        :background-color="variables.headMenuBg"
        :text-color="variables.headMenuText"
        :active-text-color="variables.headMenuActiveText"
      >
        <sidebar-item
          v-for="route in permission_routes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </div>
  </el-scrollbar>
</template>

<script>
import { mapGetters } from 'vuex'
import SidebarItem from './SidebarItem'
import variables from '@/assets/styles/variables.scss'

export default {
  name: 'Headbar',
  components: { SidebarItem },
  data() {
    return {
      logo: require('@/assets/images/headbar/logo.png'),
      badge: require('@/assets/images/headbar/logo_docare.png')
    }
  },
  computed: {
    ...mapGetters(['permission_routes', 'sidebar']),
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  }
}
</script>
<style lang="scss">
.headbar {
  display: flex;
  align-items: center;
  .logo-wrapper {
    img {
      width: 150px;
      height: 40px;
      line-height: 50px;
    }
  }
}
</style>
