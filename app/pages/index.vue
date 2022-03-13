<template>
    <div class="row">
        <div class="col-12"></div>
    </div>
</template>
<script>
export default {
    middleware: 'authenticated',
    mounted() {
        $nuxt.$router.push('/dashboard');
    },
};
</script>
<style></style>
