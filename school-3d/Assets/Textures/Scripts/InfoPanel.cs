using UnityEngine;

public class InfoPanel : MonoBehaviour
{
    public GameObject panel;
    public float showDistance = 3f;
    private Transform player;

    void Update()
    {
        if (player == null)
        {
            GameObject p = GameObject.FindWithTag("Player");
            if (p != null) player = p.transform;
            return;
        }

        float dist = Vector3.Distance(transform.position, player.position);
        panel.SetActive(dist < showDistance);

        if (dist < showDistance && Camera.main != null)
        {
            panel.transform.LookAt(Camera.main.transform);
            panel.transform.Rotate(0, 180, 0);
        }
    }
}