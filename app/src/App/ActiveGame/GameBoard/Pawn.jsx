import React from 'react'
import { useDrag, DragPreviewImage } from 'react-dnd'

import ItemTypes from './ItemTypes';
import PawnImage from '../../PawnImage.jsx';

const previewImage = 'data:image/gif;base64,R0lGODlhQABAAPcAAAAAABAAABAQABDGACEAACEQACkAACkpKTEAADEQADk5OUIhMUIxEEJCQkoAAEohEFIAAFIhEFIxMVopGFopIWspEGsxEGs5KWtra3MpGHMxEHMxGHMxIXsAAHs5GHs5IXtCIYQAAIRCIYRSMYw5KYxKKYxSKYxSMZQxAJRCMZRKKZRKOZxKOZxSMZxSQq1aKa1aMa1jMa2cnLVjMbVrObWllL1rOb1rQr1zQr1zSr17SsZrQsZzQsZ7SsZ7Usa1tc57Ss57Us6EUs6MY9aEY9aMa9aca9alc9ate9bGxt6Ma96Mc96cc96te96thN69Wvfn1v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////yH5BAEAAP8ALAAAAABAAEAAAAj+AP8JHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmyJUMAMGG6fDkhxYwVG2ICmFkQpocNGmjwIEJDBIcMMXkCKJFiRQqmK4bSSEGjBwsOO1suvUHjxs0UIlbMENEDyRIfLrBqXYLEiY8eNGI6LfLE7A0XSLOiBPBDyJIiQnzchFIDwAoaS/6i/ZA2wN4fUG4EFkKDRo0khAF0deEDRw4cNNLqJQkAyoIGN0B/iFkDCoAZPW6AmODC712kJgP8ADDgQokLAybgEAGgcFQaEQKcwFHER4sVo0fuBDAhRlyxJSLATNHj5gQAH07+nPAR92RWAESIdBeh3TCPGWC/AwiwYgiP6KSP9OBxRMQDACTQkAMRN6QAwn//AMABEdCp9Fpcq6UAww1EGAGDBTdQMB0DRTDgmIMlfBBACi1MyMOFJLQAggEGAFDEDGqtpNMGH1iwgQUBWmBACAJExSB+JgEQQw4+AGABVSngSEAHECAQFxM6AFkSAFHmAJOPKRCAQpMJwKRDDFKSFgN0AQTAIoshNAkCdF+uUIBWMWAF3o4oRIAAB2JZCYAAAYRJGgEJOkUnBA742EMKAXBA3EwA2JBDCQYgEAJ4Q/GwglgeLKoVC+9BCgAEhtFwE3xL+TnlVCJo2Cd9NkH3AQxwOTHa53wjaBhTnyXkEIMHpu4lAg0kyKSgCDqoIEGvQQIwggAHnCfACAAc8KFSGDDbwHkYAKCAAsiWJEADMmDQrEAAgCtut1M2MO5A5R4gAE89vVuQAOjCa++9+Oar77789uvvvwAHLPDABBdsML8BAQA7'; // TODO :)


export default function Pawn ({ position, name, back, sideLength, classList, newProps, isBoard }) {
  const [{ isDragging }, drag, preview] = useDrag({
    item: {
      type: ItemTypes.PAWN,
      newProps: newProps,
      position: position
    },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  })


  return <>
    <DragPreviewImage connect={preview} src={previewImage} />
    <div ref={drag} style={{
      opacity: isDragging ? 0.5 : 1,
      fontSize: 25,
      cursor: 'move',
    }}>
      <PawnImage name={name} back={back} sideLength={sideLength} classList={classList} newProps={newProps} isBoard={isBoard} />
    </div>
  </>
}