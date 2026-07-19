# ReproductionWidget

<!-- STORY -->

<hr>

A reproduction player that exposes an object that allows users to play around with the reproduction, e.g., stop/pause it.
Currently, it supports YouTube videos, MP3 audio files, and a silent mode, meaning a reproduction without associated media, ideal for playing an instrument without any music but with the time running.


## Usage

### YouTube

```jsx
<ReproductionWidget
  trainingMode={true}
  videoId={'jFI-RBqXzhU'}
  onInit={(reproduction) => { reproduction.start() }}
  onVideoUnavailable={() => console.error('Video unavailable')}
/>
```

### MP3

```jsx
<ReproductionWidget
  trainingMode={true}
  mp3File={'https://example.com/song.mp3'}
  onInit={(reproduction) => { reproduction.start() }}
  onMp3Unavailable={() => console.error('MP3 unavailable')}
/>
```

### PlayAlong (silent)

```jsx
<ReproductionWidget
  trainingMode={false}
  duration={220}
  songTempo={180}
  onInit={(reproduction) => { reproduction.start() }}
/>
```

##### Required props

| Name                 | Type       | Description                                                                              |
|----------------------|------------|------------------------------------------------------------------------------------------|
| `trainingMode`       | `boolean`  | If true, will reproduce media (YouTube or MP3); otherwise, silent mode will be used      |
| `duration`           | `number`   | Song duration (required if trainingMode === false)                                       |
| `videoId`            | `string`   | YouTube video id (required if trainingMode === true and using YouTube; mutually exclusive with `mp3File`) |
| `mp3File`            | `string`   | MP3 audio URL (required if trainingMode === true and using MP3; mutually exclusive with `videoId`) |
| `onVideoUnavailable` | `function` | Fired when the YouTube video is not available <br/> due to restrictions like age verification, regional limits, copyright issues, <br/>or if the video isn't allowed to be embedded on other platforms<br/> (required if using YouTube) |
| `onMp3Unavailable`   | `function` | Fired when the MP3 audio file fails to load or is unavailable<br/> (required if using MP3) |
| `onInit`             | `function` | Fired when the reproduction is ready to use                                              |   

##### Optional props

| Name            | Type       | Default | Description                                            |
|-----------------|------------|---------|--------------------------------------------------------|
| `songTempo`     | `number`   | `0`     | The song tempo, affects the counting in event          |
| `initialVolume` | `number`   | `50`    | The initial song volume (YouTube and MP3)              |
