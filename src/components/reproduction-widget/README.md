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
/>
```

##### Required props

| Name           | Type       | Description                                                                         |
|----------------|------------|-------------------------------------------------------------------------------------|
| `trainingMode` | `boolean`  | If true, will reproduce the video with youtube, otherwise, silent mode will be used |
| `videoId`      | `string`   | YouTube video id (required if trainingMode === true)                                |
| `onInit`       | `function` | Fired when the reproduction is ready to use                                         |   
