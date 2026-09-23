using UnityEngine;

public class bill : MonoBehaviour
{
    public Camera targetCamera;

    void Start()
    {
        if (targetCamera == null)
        {
            targetCamera = Camera.main;
        }
    }

    void LateUpdate()
    {
        // カメラの方向を向くように回転
        transform.forward = targetCamera.transform.forward;
    }
}