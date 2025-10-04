# ReproductionWidget

<!-- STORY -->

<hr>

A reproduction player that exposes an object that allows users to play around with the reproduction, e.g., stop/pause it.
Currently, it supports YouTube videos and a silent mode, meaning a reproduction without associated media, ideal for playing an instrument without any music but with the time running.


## Usage

```jsx
<ReproductionWidget
  trainingMode={true}
  videoId={'jFI-RBqXzhU'}
  onInit={(reproduction) => { reproduction.start() }}
  onVideoUnavailable={() => console.error('Video unavailable')}
/>
```

##### Required props

| Name                 | Type       | Description                                                                              |
|----------------------|------------|------------------------------------------------------------------------------------------|
| `trainingMode`       | `boolean`  | If true, will reproduce the video with youtube, otherwise, silent mode will be used      |
| `duration`           | `number`   | Song duration (required if trainingMode === false)                                       |
| `videoId`            | `string`   | YouTube video id (required if trainingMode === true)                                     |
| `onVideoUnavailable` | `function` | Fired when the YouTube video is not available <br/> due to restrictions like age verification, regional limits, copyright issues, <br/>or if the video isn't allowed to be embedded on other platforms<br/> (required if trainingMode === true) |
| `onInit`             | `function` | Fired when the reproduction is ready to use                                              |   

##### Optional props

| Name            | Type       | Default | Description                                            |
|-----------------|------------|---------|--------------------------------------------------------|
| `songTempo`     | `number`   | `0`     | The song tempo, affects the counting in event          |
| `initialVolume` | `number`   | `50`    | The initial song volume                                |
