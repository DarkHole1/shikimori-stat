# shikimori-stat

Генератор картинок со статистикой [Shikimori](https://shikimori.me/)
Генератор картинок со статистикой [Shikimori](https://shikimori.me/)

[![Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/m794305871-697b6dbfea314bec7763d310)](https://status.ivanik.ru)

## Пример

Пример статистики моего аккаунта

[![Статистика](https://stat.darkhole.space/stat.svg?user=494411&blankcolor=c9c9c9&mincolor=245652&maxcolor=009688&textcolor=888888)](https://shikimori.me/DarkHole)

## Запрос картинки

Картинку можно получить по ссылке

```
https://stat.darkhole.space/stat.svg?user=494411&blankcolor=c9c9c9&mincolor=245652&maxcolor=009688&textcolor=888888
```

Параметры:

| Параметр     | Значение                                |
| ------------ | --------------------------------------- |
| `type`       | Тип картинки. SVG или PNG               |
| `user`       | ID пользователя                         |
| `blankcolor` | Цвет пустых клеток                      |
| `mincolor`   | Цвет клеток при минимальной активности  |
| `maxcolor`   | Цвет клеток при максимальной активности |
| `textcolor`  | Цвет текста                             |

Все цвета передаются в HEX формате без решетки, например `textcolor=ffffff`

## Вставка на Shikimori

На Shikimori картинку можно вставить двумя способами:

Как постер. Он будет не кликабелен и автоматически принимает нужный размер.

```bbcode
[poster]
https://stat.darkhole.space/stat.svg?user=494411&blankcolor=c9c9c9&mincolor=245652&maxcolor=009688&textcolor=888888
[/poster]
```

Как картинку. Будет кликабельна, размер задается вручную.

```bbcode
[img 875x128]
https://stat.darkhole.space/stat.svg?user=494411&blankcolor=c9c9c9&mincolor=245652&maxcolor=009688&textcolor=888888
[/img]
```

## Получение ID пользователя

ID пользователя можно получить из ссылки на аватарку в названии файла.

Например в этой ссылке ID 428722.

```
https://moe.shikimori.me/system/users/x160/428722.png
                                            ^^^^^^
```
