// react hook
import { useState, useEffect, useRef } from "react"
// react-image-crop libraries
import ReactCrop from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
// Style
import "./AddImg.css"

function CropImgPopup({
  upImg,
  setUpImg,
  crop,
  setCrop,
  completedCrop,
  setCompletedCrop,
  setFinalCrop,
  imgRef,
  setIsPopup,
  inputRef,
}) {
  const initCropSize = (img) => {
    imgRef.current = img
    let max = img.width < img.height ? img.width : img.height // Get max width, height px (Base on minium value between width and height)
    setCrop({
      unit: "px",
      width: max,
      height: max,
      aspect: 1 / 1,
    })
    return false // Return false when setting crop state in here.
  }

  return (
    <div className="popupContainer">
      <ReactCrop
        className="cropSection"
        src={upImg}
        crop={crop}
        onChange={(c) => setCrop(c)}
        onImageLoaded={initCropSize}
        onComplete={(c) => {
          console.log(c)
          setCompletedCrop(c)
        }}
      />
      <div className="menuSection">
        <button
          className="save"
          onClick={() => {
            setFinalCrop(completedCrop)
            setIsPopup(false)
          }}
        >
          Save
        </button>
        <button
          className="cancel"
          onClick={() => {
            inputRef.current.value = ""
            setIsPopup(false)
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function AddImg({ no }) {
  const [isPopup, setIsPopup] = useState(false)
  const [upImg, setUpImg] = useState()
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState(null)
  const [finalCrop, setFinalCrop] = useState()
  const inputRef = useRef(null)
  const imgRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!finalCrop || !canvasRef.current || !imgRef.current) {
      return
    }

    const image = imgRef.current
    const canvas = canvasRef.current
    const crop = finalCrop

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const ctx = canvas.getContext("2d")
    const pixelRatio = window.devicePixelRatio

    canvas.width = crop.width * pixelRatio * scaleX
    canvas.height = crop.height * pixelRatio * scaleY

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    ctx.imageSmoothingQuality = "high"

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    )
  }, [finalCrop])

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader()
      reader.readAsDataURL(e.target.files[0]) // Read file object (from e.target.files[0]). After read completed, reader.result contain data: URL representing the file's data.
      reader.addEventListener("load", () => setUpImg(reader.result)) // Fired when a read has completed successfully, saved render.result to upImg.
      // upImg is useState hook, used for src in <ReactCrop />
      setIsPopup(true) // show popup after read image success
    }
  }

  return (
    <>
      {finalCrop ? (
        <canvas
          ref={canvasRef}
          style={{
            width: Math.round(completedCrop?.width ?? 0),
            height: Math.round(completedCrop?.height ?? 0),
          }}
        ></canvas>
      ) : (
        <>
          <input
            type="file"
            accept="image/jpeg, image/png"
            onChange={onSelectFile}
            ref={inputRef}
          />
          {isPopup ? (
            <CropImgPopup
              upImg={upImg}
              setUpImg={setUpImg}
              crop={crop}
              setCrop={setCrop}
              completedCrop={completedCrop}
              setCompletedCrop={setCompletedCrop}
              setFinalCrop={setFinalCrop}
              imgRef={imgRef}
              setIsPopup={setIsPopup}
              inputRef={inputRef}
            />
          ) : null}
        </>
      )}
    </>
  )
}
