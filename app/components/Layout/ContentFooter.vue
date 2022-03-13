<template>
  <footer class="footer">
    <div class="container-fluid">
      <ul class="nav">
        <li class="nav-item">
          <a
            :href="$t('contentFooter.mainUrl')"
            target="_blank"
            rel="noopener"
            class="nav-link"
          >
            {{$t('contentFooter.main')}}
          </a>
        </li>
        <li class="nav-item">
          <a
            :href="$t('contentFooter.aboutUrl')"
            target="_blank"
            rel="noopener"
            class="nav-link"
          >
            {{$t('contentFooter.about')}}
          </a>
        </li>
        <li class="nav-item">
          <a
            :href="$t('contentFooter.blogUrl')"
            target="_blank"
            rel="noopener"
            class="nav-link"
          >
            {{$t('contentFooter.blog')}}
          </a>
        </li>
      </ul>
      <div class="copyright">
        &copy; {{ year }}, made with <i class="tim-icons icon-heart-2"></i> by
        
        <a
          :href="$t('contentFooter.copyrightUrl')"
          target="_blank"
          rel="noopener"
          >{{$t('contentFooter.copyright')}}</a
        >
        for a better web.
      </div>
    </div>
  </footer>
</template>
<script>
export default {
  data() {
    return {
      year: new Date().getFullYear()
    };
  }
};
</script>
<style></style>
