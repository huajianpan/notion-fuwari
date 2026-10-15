---
title: 'cloudflare云存储极速加速，R2 + EdgeOne 完美组合'
published: 2026-01-16
description: '_**经测试对网站的加速使用源站配置 对象存储源站可以加速，其他的不行**_'
image: '../assets/images/cloudflare云存储极速加速-r2-edgeone-完美组合/cover.webp'
tags: []
draft: false
lang: ''
---


![image1.webp](https://prod-files-secure.s3.us-west-2.amazonaws.com/026911c3-4e14-42f8-8c54-f06653201a04/c0ed25a7-c3f3-4e72-a607-10415864e03e/image1.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466ZEPAPT47%2F20261015%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20261015T194139Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEAwaCXVzLXdlc3QtMiJHMEUCIQCOyWb6mnqChx1dVzdy2e%2FjgjjQYxvSaZeOEXC2A65UTQIgf%2FRA7A2miE5KhPzgKxM3P0whppDYP%2BJyW96OVEZHEzcqiAQI1P%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw2Mzc0MjMxODM4MDUiDJ9gzk%2FlBzru6LsXqyrcA3hBn%2BWzIDbBglg3cdz%2BBdqje%2FHB83l5OSbL3sUlTnhFYe%2FXfXwH0psskDybLRSfDNWcvlgX7VlynYGHAqQBBglTkaHq%2F3LTBXw0HM4SrSQNOrxnJcmkomHqxzGHxStBqW8BggZPljkB%2FkGYgMfV7v4NiOz09rUwYpMeuAk1j4KWkkEIyCQW9a4%2Bx4moV23zPAwSpUohcdO6qZWfZBNi1vWzJcHJq7PHNRJcFdPDj8hOHnz3eGELSO%2FySPQc3yUeXzdZofsXZgWiyzJ5XjZ7ZMC6EH1MDiIC7C2U6eoZXHfYDR7gAY0nFIT0t6rvy5yfrmRnVDkLHo4bfsblhtzbyiUP9Wc7HR9y0xKzukAvmwjutvYZrQeQemyQByrma8J1Ylr96NRIdJ4ZuOHloiuRYVp7i4p6U5bktPVmoTjKM99WtFd4pxryjtGZ8EVBJNI8MH%2FbWRok0sBPHyW3QLs%2FIEZs9GPTpl0FkEZwKOMhNKIR48xf%2Ba4IxyavgKf%2BxD8zycW8MijXI71jpA%2Bu6pOj3hPF0ECzFD1U47DZMXnPutb9SyWRYwWeRaZI5EGFMWmPqYAkXP3JwhUv5hPJvORgxRXua1embniCkeSDWIvfUJD6gRqsLWMNNyjcGOysMJXUxNYGOqUB5gITjHAnZWD05tVADIZAwZO99edkTeTI3Eg6gWpJdTzTDNegm0x97XVEpTR6oNsbXcfz5mi2ovJn2E%2FRq3yqh6EEoznuh1N%2BDEHjBLZCjp%2B2Hzrq%2BiauCUexlJ8FU24d0MkdjWPfH8ZQDpdWRilg7OavQSvlf4QqAQPUZsAQS%2Fc2Uspuqa2J%2BHBzExHE0EVucA4uD1IspSxI1ERNoZWJBnWUtJOh&X-Amz-Signature=4f84e58bae45a03ad6f544c053b232eddbff005b314aad3d0a2f414cad5b3c19&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


## **Bilibili**


## **1、先开启 cloudflare 的自定义域名**


![image2.webp](../assets/images/cloudflare云存储极速加速-r2-edgeone-完美组合/image-2.webp)


## **2、EdgeOne 添加 cdn 域名**


![image3.webp](../assets/images/cloudflare云存储极速加速-r2-edgeone-完美组合/image-3.webp)


![image4.webp](../assets/images/cloudflare云存储极速加速-r2-edgeone-完美组合/image-4.webp)


## **3、配置域名设置回源站点为 R2 的自定义域名站点**


_**经测试对网站的加速使用源站配置 对象存储源站可以加速，其他的不行**_


![image5.webp](../assets/images/cloudflare云存储极速加速-r2-edgeone-完美组合/image-5.webp)


## **4、域名服务商配置域名的 cname 指向 EO 的 cname 地址**


![image6.webp](../assets/images/cloudflare云存储极速加速-r2-edgeone-完美组合/image-6.webp)


## **4、配置 https 证书**


![image7.webp](../assets/images/cloudflare云存储极速加速-r2-edgeone-完美组合/image-7.webp)


![image8.webp](../assets/images/cloudflare云存储极速加速-r2-edgeone-完美组合/image-8.webp)


## **5、此时已经完成了 cdn 的操作，接下来我们配置边缘函数来将 png 转换为 webp 图片减小图片体积**


![image9.webp](../assets/images/cloudflare云存储极速加速-r2-edgeone-完美组合/image-9.webp)


![image10.webp](../assets/images/cloudflare云存储极速加速-r2-edgeone-完美组合/image-10.webp)


![image11.webp](../assets/images/cloudflare云存储极速加速-r2-edgeone-完美组合/image-11.webp)


## **6、添加触发规则**


![image12.webp](../assets/images/cloudflare云存储极速加速-r2-edgeone-完美组合/image-12.webp)


![image13.webp](../assets/images/cloudflare云存储极速加速-r2-edgeone-完美组合/image-13.webp)


## **7、大功告成！附上前后对比图**


![image14.webp](../assets/images/cloudflare云存储极速加速-r2-edgeone-完美组合/image-14.webp)


![image15.webp](../assets/images/cloudflare云存储极速加速-r2-edgeone-完美组合/image-15.webp)


**cloudflare云存储极速加速，R2 + EdgeOne 完美组合**


[https://www.zhaoyuqi.top/posts/cloudflare-r2-edgeone/](https://www.zhaoyuqi.top/posts/cloudflare-r2-edgeone/)


作者


爱哭的赵一一


发布于


2025-08-10


许可协议


[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)

